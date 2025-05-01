import Elysia from "elysia"
import Stripe from 'stripe'
import { PrismaClient } from "../../prisma-client";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-03-31.basil', // Use the latest API version
})
const prisma = new PrismaClient()
export const paymentModule = new Elysia({
    prefix: '/payment',
  }).post('/create-payment-intent', async ({ body }) => {
    try {
        const { seats, userId, amount } = body as {
            seats: { seat_id: string; flight_id: string; price: number }[]
            userId: string
            amount: number
        }
    
        // ตรวจสอบข้อมูลเบื้องต้น
        if (!seats || !seats.length || !userId) {
            return {
            success: false,
            error: 'Invalid data'
            }
        }
  
        // ตรวจสอบสถานะที่นั่ง
        // Function to create a safe placeholder string with the right number of placeholders
        const createPlaceholders = (count: number) => {
            return Array(count).fill('(?,?)').join(',');
        };

        // Create a flat array of parameters, alternating seat_id and flight_id
        const params: string[] = [];
        seats.forEach(seat => {
            params.push(seat.seat_id);
            params.push(seat.flight_id);
        });

        // Build the SQL query with placeholders
        const placeholdersString = createPlaceholders(seats.length);
        const query = `
            SELECT 
                seatId,
                flightId
            FROM ticket
            WHERE 
                (seatId, flightId) IN (${placeholdersString})
        `;
        
        // Execute the raw query with blind parameters
        const availableSeats = await prisma.$queryRawUnsafe(
            query,
            ...params
        );
        
        // If availableSeats returns any rows, those seat/flight combinations are NOT available
        const unavailableSeats = availableSeats as { seatId: string, flightId: string }[];
        
        if (unavailableSeats.length > 0) {
            // Some seats are already taken
            return {
            status: 400,
            body: {
                message: 'Some selected seats are already booked',
                unavailableSeats: unavailableSeats
            }
            };
        }
  
        // คำนวณราคาทั้งหมด (หน่วยเป็น สตางค์/เซนต์)
        const totalAmount = amount
        const compactSeats = Object.entries(
            seats.reduce((acc, { flight_id, seat_id }) => {
              if (!acc[flight_id]) acc[flight_id] = []
              acc[flight_id].push(seat_id)
              return acc
            }, {} as Record<string, string[]>)
          )
          .map(([flightId, seatIds]) => `${flightId}:${seatIds.join('|')}`)
          .join(';')
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount,
            currency: 'thb',
            payment_method_types: ['card', 'promptpay'],
            metadata: {
                user_id: userId,
                seats: compactSeats
            },
        })
  
        return {
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        }
    } catch (error) {
        console.error('Error creating PaymentIntent:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
})
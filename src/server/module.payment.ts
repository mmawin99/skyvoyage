import Elysia, {error} from "elysia"
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe'
import { PrismaClient } from "../../prisma-client";
import { searchSelectedRoutes } from '@/types/type';

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
    } catch (err) {
        console.error('Error creating PaymentIntent:', err)
        return error(500, {
            success: false,
            error: err instanceof Error ? err.message : 'Unknown error'
        })
    }
})
.post("/booking", async ({ body }: {
    body: {
      selectedRoute: searchSelectedRoutes
      userid: string,
      paymentReference: string,
      paymentDate: string,
      paymentMethod: string,
      totalFare: number
    }
  })  => {
    try {
      // Start a transaction
      const result = await prisma.$transaction(async (tx) => {
        const { selectedRoute, userid, paymentReference, paymentDate, paymentMethod, totalFare } = body;
        const bookingId = uuidv4();
        
        // 1. Create the booking record
        await tx.$queryRaw`
          INSERT INTO booking (bookingId, bookingDate, status, userId)
          VALUES (${bookingId}, NOW(), 'PAID', ${userid})
        `;
        
        // 2. Process all passengers and their tickets
        if (!selectedRoute.passenger) {
          throw new Error("Passenger data is missing in the selected route.");
        }
        for (const passenger of selectedRoute.passenger) {
          // Check if passenger exists
          const existingPassenger = await tx.$queryRaw`
            SELECT passportNum FROM passenger 
            WHERE passportNum = ${passenger.passportNum}
            AND userId = ${userid}
            LIMIT 1
          `;
          
          // If passenger doesn't exist, create a new one
          if (!existingPassenger || (existingPassenger as { passportNum: string }[]).length === 0) {
            await tx.$queryRaw`
              INSERT INTO passenger (
                passportNum, 
                passportCountry, 
                passportExpiry, 
                firstName, 
                lastName, 
                dateOfBirth, 
                nationality, 
                ageRange, 
                userId
              )
              VALUES (
                ${passenger.passportNum},
                ${passenger.passportCountry},
                STR_TO_DATE(${passenger.passportExpiry}, '%Y-%m-%dT%H:%i:%s.%fZ'),
                ${passenger.firstName},
                ${passenger.lastName},
                STR_TO_DATE(${passenger.dateOfBirth}, '%Y-%m-%dT%H:%i:%s.%fZ'),
                ${passenger.nationality},
                ${passenger.ageRange},
                ${userid}
              )
            `;
          }
          
          // Link passenger to booking
          await tx.$queryRaw`
            INSERT INTO passenger_booking (bookingId, passportNum)
            VALUES (${bookingId}, ${passenger.passportNum})
          `;
          
          // Process all tickets for this passenger
          for (const ticket of passenger.ticket) {
            const ticketId = uuidv4();
            
            await tx.$queryRaw`
              INSERT INTO ticket (
                ticketId,
                farePackage,
                baggageAllowanceWeight,
                baggageAllowancePrice,
                mealSelection,
                mealPrice,
                ticketPrice,
                bookingId,
                flightId,
                passportNum,
                seatId
              )
              VALUES (
                ${ticketId},
                ${selectedRoute.selectedDepartRoute.selectedFare},
                ${ticket.baggageAllowanceWeight},
                ${ticket.baggageAllowancePrice},
                ${ticket.mealSelection},
                ${ticket.mealPrice},
                ${ticket.seatPrice},
                ${bookingId},
                ${ticket.fid},
                ${passenger.passportNum},
                ${ticket.seatId || null}
              )
            `;
          }
        }
        
        // 3. Create booking_flight records for departure route
        // Process all segments in the departure flight
        if (selectedRoute.selectedDepartRoute && selectedRoute.selectedDepartRoute.flight.segments) {
          for (const segment of selectedRoute.selectedDepartRoute.flight.segments) {
            await tx.$queryRaw`
              INSERT INTO booking_flight (bookingId, flightId)
              VALUES (${bookingId}, ${segment.flightId})
            `;
          }
        } else {
          // If there are no segments, use the main flight ID
          await tx.$queryRaw`
            INSERT INTO booking_flight (bookingId, flightId)
            VALUES (${bookingId}, ${selectedRoute.selectedDepartRoute.flightId})
          `;
        }
        
        // 4. Create booking_flight records for return route (if exists)
        if (selectedRoute.selectedReturnRoute) {
          if (selectedRoute.selectedReturnRoute.flight.segments) {
            for (const segment of selectedRoute.selectedReturnRoute.flight.segments) {
              await tx.$queryRaw`
                INSERT INTO booking_flight (bookingId, flightId)
                VALUES (${bookingId}, ${segment.flightId})
              `;
            }
          } else {
            await tx.$queryRaw`
              INSERT INTO booking_flight (bookingId, flightId)
              VALUES (${bookingId}, ${selectedRoute.selectedReturnRoute.flightId})
            `;
          }
        }
        
        // 5. Create payment record
        await tx.$queryRaw`
          INSERT INTO payment (
            paymentId,
            amount,
            method,
            paymentDate,
            bookingId
          )
          VALUES (
            ${paymentReference},
            ${totalFare},
            ${paymentMethod},
            STR_TO_DATE(${paymentDate}, '%Y-%m-%dT%H:%i:%s.%fZ'),
            ${bookingId}
          )
        `;
        
        return { success: true, bookingId };
      });
      
      return {
        success: true,
        data: result
      };
    } catch (err) {
      console.error("Booking error:", err);
      return error(500, {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error occurred"
      });
    }
  });
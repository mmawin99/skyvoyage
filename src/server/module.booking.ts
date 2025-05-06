import Elysia, {error} from "elysia"
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe'
import { passenger as Passenger, PrismaClient } from "../../prisma-client";
import { createUniversalFlightSchedule, sanitizeBigInt } from "./lib";
import { BookingStatus, FareType, PassengerFillOut, PassengerTicket, searchSelectedBookingRoutes } from "@/types/type";
import {BookingRow, FlightOperationRow, PassengerRow, TicketRow} from "@/types/booking"


// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-03-31.basil', // Use the latest API version
})
const prisma = new PrismaClient()

export const bookingModule = new Elysia({
    prefix: '/booking',
})
.post('/create-payment-intent', async ({ body }) => {
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
.post("/book", async ({ body }: {
  body: {
    selectedRoute: searchSelectedBookingRoutes
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

      // Create maps to track adults and their seats for infant assignment
      const adultSeats = new Map();
      let adultCounter = 1;
      let infantCounter = 1;

      // First pass: identify all adult passengers and their seats
      for (const passenger of selectedRoute.passenger) {
        if (passenger.ageRange === 'Adult') {
          // Store seat IDs for each adult's tickets
          const adultSeatIds = passenger.ticket.map(ticket => ticket.seatId);
          adultSeats.set(adultCounter, adultSeatIds);
          adultCounter++;
        }
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
        
        // Link passenger to booking (now includes userId)
        await tx.$queryRaw`
          INSERT INTO passenger_booking (bookingId, passportNum, userId)
          VALUES (${bookingId}, ${passenger.passportNum}, ${userid})
        `;
        
        // Process all tickets for this passenger
        for (let i = 0; i < passenger.ticket.length; i++) {
          const ticket = passenger.ticket[i];
          const ticketId = uuidv4();
          
          // If passenger is an infant, assign them the same seat as the corresponding adult
          let seatIdToUse = ticket.seatId;
          
          if (passenger.ageRange === 'Infant') {
            // Get the corresponding adult's seat ID for the same segment/ticket index
            const adultSeatIds = adultSeats.get(infantCounter);
            if (adultSeatIds && adultSeatIds[i]) {
              seatIdToUse = adultSeatIds[i];
            }
          }
          
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
              userId,
              seatId
            )
            VALUES (
              ${ticketId},
              ${
                selectedRoute.selectedDepartRoute.flightId == ticket.fid ? 
                selectedRoute.selectedDepartRoute.selectedFare : 
                selectedRoute.selectedDepartRoute.flightId.includes(ticket.fid) ?
                selectedRoute.selectedDepartRoute.selectedFare :
                selectedRoute.selectedReturnRoute?.selectedFare
              },
              ${ticket.baggageAllowanceWeight},
              ${ticket.baggageAllowancePrice},
              ${ticket.mealSelection},
              ${ticket.mealPrice},
              ${
                selectedRoute.selectedDepartRoute.flightId == ticket.fid ?
                selectedRoute.selectedDepartRoute.price :
                selectedRoute.selectedDepartRoute.flightId.includes(ticket.fid) ?
                (selectedRoute.selectedDepartRoute.price / 2) :
                selectedRoute.selectedReturnRoute?.flightId == ticket.fid ?
                selectedRoute.selectedReturnRoute.price :
                ((selectedRoute.selectedReturnRoute?.price ?? 0) / 2)
              },
              ${bookingId},
              ${ticket.fid},
              ${passenger.passportNum},
              ${userid},
              ${seatIdToUse}
            )
          `;
        }
        
        // Increment infantCounter if this was an infant passenger
        if (passenger.ageRange === 'Infant') {
          infantCounter++;
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
})
.get("/passenger/:userId", async ({ params, query }:{params:{userId:string}, query:{seldate:string}}) => {
  try {
    // the url is in format /passenger/:userId?date={ISODate} 
    const { userId } = params;
    const { seldate } = query;
    const passengers:Passenger[] = await prisma.$queryRaw`
      SELECT 
        passportNum,
        passportCountry,
        passportExpiry,
        title,
        firstName,
        lastName,
        dateOfBirth,
        nationality,
        ageRange
      FROM passenger
      WHERE userId = ${userId} AND
      passportExpiry > DATE_ADD(STR_TO_DATE(${seldate}, '%Y-%m-%dT%H:%i:%s.%fZ'), INTERVAL 60 DAY)
    `;
    return {
      success: true,
      // query: params,
      passengers: sanitizeBigInt(passengers)
    }
  } catch (err) {
    console.error("Error fetching passengers:", err);
    return error(500, {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error occurred"
    });
  }
})
.get("/mybookings/:userId", async ({ params }) => {
  try {
    const { userId } = params;

    // Fetch all bookings for the user
    const bookings = await prisma.$queryRaw<BookingRow[]>`
      SELECT 
        b.bookingId, 
        b.bookingDate, 
        b.status, 
        b.userId,
        p.paymentId,
        p.amount as totalAmount,
        p.method as paymentMethod,
        p.paymentDate
      FROM booking b
      LEFT JOIN payment p ON p.bookingId = b.bookingId
      WHERE b.userId = ${userId}
      ORDER BY b.bookingDate DESC
    `;

    if (!bookings || bookings.length === 0) {
      return {
        success: true,
        data: []
      };
    }

    const transformedBookings: searchSelectedBookingRoutes[] = [];

    // Process each booking
    for (const booking of bookings) {
      // Get flight operations (instances) for this booking
      const flightOperations = await prisma.$queryRaw<FlightOperationRow[]>`
        SELECT 
          fo.flightId,
          fo.flightNum,
          fo.airlineCode,
          fo.departureTime,
          fo.arrivalTime,
          fo.departureGate,
          fo.aircraftId,
          a.model as aircraftModel,
          f.departAirportId,
          f.arriveAirportId,
          depAirport.name as departureAirportName,
          depAirport.timezone as departureAirportTimezone,
          arrAirport.name as arrivalAirportName,
          arrAirport.timezone as arrivalAirportTimezone,
          airline.airlineName
        FROM booking_flight bf
        JOIN flightOperate fo ON bf.flightId = fo.flightId
        JOIN flight f ON fo.flightNum = f.flightNum AND fo.airlineCode = f.airlineCode
        JOIN aircraft a ON fo.aircraftId = a.aircraftId
        JOIN airport depAirport ON f.departAirportId = depAirport.airportCode
        JOIN airport arrAirport ON f.arriveAirportId = arrAirport.airportCode
        JOIN airline ON fo.airlineCode = airline.airlineCode
        WHERE bf.bookingId = ${booking.bookingId}
        ORDER BY fo.departureTime ASC
      `;

      if (flightOperations.length === 0) continue;

      // Get passengers for this booking
      const passengers = await prisma.$queryRaw<PassengerRow[]>`
        SELECT 
          p.passportNum,
          p.passportCountry,
          p.passportExpiry,
          p.firstName,
          p.lastName,
          p.dateOfBirth,
          p.nationality,
          p.ageRange
        FROM passenger_booking pb
        JOIN passenger p ON pb.passportNum = p.passportNum
        WHERE pb.bookingId = ${booking.bookingId}
      `;

      // Get tickets for this booking
      const tickets = await prisma.$queryRaw<TicketRow[]>`
        SELECT 
          t.ticketId,
          t.farePackage,
          t.baggageAllowanceWeight,
          t.baggageAllowancePrice,
          t.mealSelection,
          t.mealPrice,
          t.ticketPrice,
          t.flightId,
          t.passportNum,
          t.seatId,
          s.seatNum,
          s.class as seatClass,
          s.price as seatPrice
        FROM ticket t
        JOIN seat s ON t.seatId = s.seatId
        WHERE t.bookingId = ${booking.bookingId}
      `;

      // Sort flights by departure time
      const sortedFlights = [...flightOperations].sort(
        (a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
      );

      // Split into depart and return flights
      const departFlights = sortedFlights.slice(0, Math.ceil(sortedFlights.length / 2));
      const returnFlights = sortedFlights.length > 1 
        ? sortedFlights.slice(Math.ceil(sortedFlights.length / 2)) 
        : undefined;

      // Get primary fare package from tickets
      const farePackage = tickets.length > 0 ? tickets[0].farePackage : "STANDARD";
      const totalFare = booking.totalAmount || 0;

      // Transform passengers with their tickets
      const transformedPassengers: PassengerFillOut[] = passengers.map(passenger => {
        const passengerTickets: PassengerTicket[] = tickets
          .filter(t => t.passportNum === passenger.passportNum)
          .map(ticket => ({
            tid: ticket.ticketId,
            fid: ticket.flightId,
            baggageAllowanceWeight: ticket.baggageAllowanceWeight,
            baggageAllowancePrice: ticket.baggageAllowancePrice,
            mealSelection: ticket.mealSelection,
            mealPrice: ticket.mealPrice,
            seatId: ticket.seatId,
            seatPrice: ticket.seatPrice || 0
          }));

        return {
          label: `${passenger.firstName} ${passenger.lastName}`,
          pid: passenger.passportNum,
          status: "FILLED",
          passportNum: passenger.passportNum,
          passportCountry: passenger.passportCountry,
          passportExpiry: new Date(passenger.passportExpiry).toISOString(),
          titleName: "", // Not in schema
          firstName: passenger.firstName,
          lastName: passenger.lastName,
          dateOfBirth: new Date(passenger.dateOfBirth).toISOString(),
          nationality: passenger.nationality,
          ageRange: passenger.ageRange as "Adult" | "Children" | "Infant",
          ticket: passengerTickets
        };
      });

      // Create depart route
      const departRoute = createUniversalFlightSchedule(departFlights);
      
      // Create the booking object in searchSelectedBookingRoutes format
      const transformedBooking: searchSelectedBookingRoutes = {
        departRoute: [departRoute],
        selectedDepartRoute: {
          selectedFare: farePackage as FareType,
          flightId: departFlights[0].flightId,
          flight: departRoute,
          price: returnFlights ? totalFare / 2 : totalFare
        },
        status: booking.status as BookingStatus,
        queryString:{
          origin: "",
          destination: "",
          departDateStr: "",
          returnDateStr: "",
          passengersStr: "",
          cabinClass: "Y",
          tripType: returnFlights ? "roundtrip" : "oneway"
        },
        totalFare: totalFare,
        passenger: transformedPassengers,
        ticket: booking.bookingId,
        payment: {
          paymentId: booking.paymentId,
          paymentMethod: booking.paymentMethod,
          paymentDate: booking.paymentDate ? new Date(booking.paymentDate).toISOString() : null
        }
      };
      
      // Add return route if exists
      if (returnFlights) {
        const returnRoute = createUniversalFlightSchedule(returnFlights);
        transformedBooking.returnRoute = [returnRoute];
        transformedBooking.selectedReturnRoute = {
          selectedFare: farePackage as FareType,
          flightId: returnFlights[0].flightId,
          flight: returnRoute,
          price: totalFare / 2
        };
      }
      
      transformedBookings.push(transformedBooking);
    }

    return {
      success: true,
      booking: transformedBookings
    };
  } catch (err) {
    console.error("Error fetching bookings:", err);
    return error(500, {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error occurred"
    });
  }
});
import Elysia, {error} from "elysia"
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe'
import { passenger as Passenger, PrismaClient } from "../../prisma-client";
import { createUniversalFlightSchedule, sanitizeBigInt, stripePayment as stripe } from "@/server/lib";
import { BookingStatus, FareType, PassengerFillOut, PassengerTicket, searchSelectedBookingRoutes } from "@/types/type";
import {BookingRow, FlightOperationRow, PassengerRow, TicketRow} from "@/types/booking"
import { customRoundPricingDown } from "@/lib/price";


// Initialize Stripe with your secret key

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
            status: false,
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
            status: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        }
    } catch (err) {
        console.error('Error creating PaymentIntent:', err)
        return error(500, {
            status: false,
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
              seatId,
              isInfant
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
              ${seatIdToUse},
              ${passenger.ageRange === 'Infant' ? true : false}
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
      
      return { status: true, bookingId };
    });
    
    return {
      status: true,
      data: result
    };
  } catch (err) {
    console.error("Booking error:", err);
    return error(500, {
      status: false,
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
      status: true,
      // query: params,
      passengers: sanitizeBigInt(passengers)
    }
  } catch (err) {
    console.error("Error fetching passengers:", err);
    return error(500, {
      status: false,
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
        p.paymentDate,
        p.refundedId as refundId,
        p.refundedDate as refundDate
      FROM booking b
      LEFT JOIN payment p ON p.bookingId = b.bookingId
      WHERE b.userId = ${userId}
      ORDER BY b.bookingDate DESC
    `;

    if (!bookings || bookings.length === 0) {
      return {
        status: true,
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

      //Payment retrival
      let paymentMethodData: Stripe.PaymentMethod | null = null;
      let paymentRefundData: Stripe.Refund | null = null;
      try {
        if (booking.paymentMethod) {
           paymentMethodData = await stripe.paymentMethods.retrieve(booking.paymentMethod);
            // paymentIntentData = await stripe.paymentIntents.retrieve(booking.paymentId);
        }
        if (booking.refundId) {
          paymentRefundData = await stripe.refunds.retrieve(booking.refundId);
        }
      } catch (error) {
        console.error("Error retrieving payment method:", error);
      }

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
          paymentDate: booking.paymentDate ? new Date(booking.paymentDate).toISOString() : null,
          data: paymentMethodData,
          refunding: {
            refundId: booking.refundId,
            refundDate: booking.refundDate ? new Date(booking.refundDate).toISOString() : null,
            data: paymentRefundData,
            status: paymentRefundData ? true : false,
          }
        },
        userId: booking.userId,
        bookingDate: booking.bookingDate ? new Date(booking.bookingDate).toISOString() : null,
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
      status: true,
      booking: transformedBookings
    };
  } catch (err) {
    console.error("Error fetching bookings:", err);
    return error(500, {
      status: false,
      error: err instanceof Error ? err.message : "Unknown error occurred"
    });
  }
})
.patch("/cancel/:userId/:bookingId", async ({ params }:{ params:{bookingId:string, userId:string}}) => {
    try{
        const { bookingId, userId } = params;
        const booking:{ bookingId:string, status:BookingStatus, paymentId: string, amount:number }[] = await prisma.$queryRaw`
            SELECT b.bookingId, b.status, p.paymentId, p.amount FROM booking b, payment p WHERE b.bookingId = ${bookingId} AND b.userId = ${userId} AND b.bookingId = p.bookingId
        `;
        
        if(booking.length == 0){
            return error(404, {
                status: false,
                message: "Booking not found",
            })
        }else if(booking[0].status != "PAID"){
            return error(400, {
                status: false,
                message: "Booking is not eligible for refund",
            })
        }else if(booking.length != 1){
            return error(400,{
                status: false,
                message: "How did you get here!",
            })
        }else{
            const flightAssociation:{ flightId:string, departureTime: Date }[] = await prisma.$queryRaw`
                SELECT 
                  booking_flight.flightId,
                  fo.departureTime
                FROM booking_flight 
                JOIN flightOperate fo ON booking_flight.flightId = fo.flightId
                WHERE bookingId = ${bookingId}
            `
            if(flightAssociation.length == 0){
                return error(404, {
                status: false,
                message: "flight association not found",
                })
            }
            // check some flight is departed, return error
            const now = new Date();
            const isFlightDeparted = flightAssociation.some(flight => {
                const flightDepartureTime = new Date(flight.departureTime);
                return flightDepartureTime < now;
            });

            if (isFlightDeparted) {
                return error(400, {
                status: false,
                message: "Booking cannot be cancelled as some flights have already departed",
                });
            }
            // Update the booking status to CANCELLED
            await prisma.$executeRaw`
                UPDATE booking SET status = 'CANCELLED' WHERE bookingId = ${bookingId}
            `
            await prisma.$executeRaw`
                UPDATE payment SET refundedId = NULL, refundedDate = NOW(), refundAmount = 0 WHERE bookingId = ${bookingId}
            `
            return {
                status: true,
                message: "Booking cancelled successfully",
                bookingId: booking[0].bookingId,
                amount: booking[0].amount,
            }
        }
    }catch(err){
        console.error("Error fetching booking:", err);
        return error(500, {
            status: false,
            error: err instanceof Error ? err.message : "Unknown error occurred"
        });
    }
})
.patch("/refund/:userId/:bookingId", async ({ params }:{ params:{bookingId:string, userId:string}}) => {
    try{
        const { bookingId, userId } = params;
        const booking:{ bookingDate:Date,bookingId:string, status:BookingStatus, paymentId: string, amount:number }[] = await prisma.$queryRaw`
            SELECT b.bookingId, b.status, b.bookingDate, p.paymentId, p.amount FROM booking b, payment p WHERE b.bookingId = ${bookingId} AND b.userId = ${userId} AND b.bookingId = p.bookingId
        `;
        if(booking.length == 0){
            return error(404, {
                status: false,
                message: "Booking not found",
            })
        }else if(booking[0].status != "PAID"){
            return error(400, {
                status: false,
                message: "Booking is not eligible for refund",
            })
        }else if(booking.length != 1){
            return error(400,{
                status: false,
                message: "How did you get here!",
            })
            //IF bookingDate is not after May 8th, 2025, then refund is not eligible at ()
        }else if(new Date(booking[0].bookingDate) < new Date("2025-05-08T06:00:00Z")){
            return error(400, {
                status: false,
                message: "Booking is not eligible for refund.",
            })
        }else{
            const flightAssociation:{ flightId:string, departureTime: Date }[] = await prisma.$queryRaw`
                SELECT 
                    booking_flight.flightId,
                    fo.departureTime
                FROM booking_flight 
                JOIN flightOperate fo ON booking_flight.flightId = fo.flightId
                WHERE bookingId = ${bookingId}
            `
            if(flightAssociation.length == 0){
            return error(404, {
                status: false,
                message: "flight association not found",
            })
            }
            // check some flight is departed, return error
            const now = new Date();
            const isFlightDeparted = flightAssociation.some(flight => {
                const flightDepartureTime = new Date(flight.departureTime);
                return flightDepartureTime < now;
            });
            if (isFlightDeparted) {
                return error(400, {
                    status: false,
                    message: "Booking cannot be refunded as some flights have already departed.",
                });
            }
            // find nearly departflight
            const nearlyDepartFlight = flightAssociation.find(flight => {
                const flightDepartureTime = new Date(flight.departureTime);
                const timeDiff = flightDepartureTime.getTime() - now.getTime();
                const hoursDiff = timeDiff / (1000 * 60 * 60); // keep as float
                return hoursDiff > 0 && hoursDiff <= 2;
            });
            if (nearlyDepartFlight) {
                return error(400, {
                    status: false,
                    message: "Booking cannot be refunded as some flights are departing soon.",
                });
            }
            const nearlyDepartFlightIn12Hr = flightAssociation.find(flight => {
                const flightDepartureTime = new Date(flight.departureTime);
                const timeDiff = flightDepartureTime.getTime() - now.getTime();
                const hoursDiff = timeDiff / (1000 * 60 * 60); // keep as float
                return hoursDiff > 0 && hoursDiff <= 12;
            });
            let refund:Stripe.Refund | null = null;
            if(nearlyDepartFlightIn12Hr){
                refund = await stripe.refunds.create({
                    payment_intent: booking[0].paymentId,
                    amount: customRoundPricingDown(booking[0].amount * 100 * 0.45), // Convert to THB stang
                    reason: "requested_by_customer",
                })
            }else{
                refund = await stripe.refunds.create({
                    payment_intent: booking[0].paymentId,
                    amount: customRoundPricingDown(booking[0].amount * 100 * 0.75), // Convert to THB stang
                    reason: "requested_by_customer",
                })
            }
            // Update the booking status to REFUNDED
            await prisma.$executeRaw`
                UPDATE booking SET status = 'REFUNDED' WHERE bookingId = ${bookingId}
            `
            await prisma.$executeRaw`
                UPDATE payment SET refundedId = ${refund.id}, refundedDate = NOW(), refundAmount = ${booking[0].amount} WHERE bookingId = ${bookingId}
            `
            return {
                status: true,
                message: "Refund successful",
                refundId: refund.id,
                bookingId: booking[0].bookingId,
                amount: booking[0].amount,
            }
        }
    }catch(err){
      console.error("Error fetching booking:", err);
      return error(500, {
        status: false,
        error: err instanceof Error ? err.message : "Unknown error occurred"
      });
    }
})
.patch("/restore-status/:userId/:bookingId", async ({ params }:{ params:{bookingId:string, userId:string}}) => {
    try{
      const { bookingId, userId } = params;
      const booking:{ bookingDate:Date,bookingId:string, status:BookingStatus, paymentId: string, amount:number, refundedId:string }[] = await prisma.$queryRaw`
        SELECT b.bookingId, b.status, b.bookingDate, p.paymentId, p.amount, p.refundedId FROM booking b, payment p WHERE b.bookingId = ${bookingId} AND b.userId = ${userId} AND b.bookingId = p.bookingId
      `;
      if(booking.length == 0){
        return error(404, {
          status: false,
          message: "Booking not found",
        })
      }else if(booking[0].status != "REFUNDED"){
        return error(400, {
          status: false,
          message: "Booking is not eligible for refund",
        })
      }else if(booking.length != 1){
        return error(400,{
          status: false,
          message: "How did you get here!",
        })
        //IF bookingDate is not after May 8th, 2025, then refund is not eligible at ()
      }else if(new Date(booking[0].bookingDate) < new Date("2025-05-08T06:00:00Z")){
        return error(400, {
          status: false,
          message: "Booking is not eligible cancel refund.",
        })
      }else{
        //Before resture refund, check if some flight departed or not
        const flight:{dtime:Date}[] = await prisma.$queryRaw`
          SELECT
              fo.departureTime as dtime
          FROM (
              SELECT flightId
              FROM booking_flight
              WHERE bookingId = ${bookingId}
          ) bf
          JOIN flightOperate fo ON bf.flightId = fo.flightId
        `
        if(flight.length == 0){
          return error(404, {
            status: false,
            message: "flight association not found",
          })
        }
        // check some flight is departed, return error
        const now = new Date();
        const isFlightDeparted = flight.some(flight => {
          const flightDepartureTime = new Date(flight.dtime);
          return flightDepartureTime < now;
        });
        if (isFlightDeparted) {
          return error(400, {
            status: false,
            message: "This booking cannot be restored as some flights have already departed.",
          });
        }
        // cancel refunded the payment here
        let refundedCancel:Stripe.Refund | null = null;
        if(booking[0].refundedId){
          refundedCancel = await stripe.refunds.cancel(booking[0].refundedId);
        }
        // Update the booking status to PAID
        await prisma.$executeRaw`
          UPDATE booking SET status = 'PAID' WHERE bookingId = ${bookingId}
        `
        // Delete the refund record
        await prisma.$executeRaw`
          UPDATE payment SET refundedId = NULL, refundedDate = NULL, refundAmount = 0 WHERE bookingId = ${bookingId}
        `
        return {
          status: true,
          message: "Refund cancelled successfully",
          refundedCancel:refundedCancel
        }
      }
    }catch(err){
      console.error("Error fetching booking:", err);
      return error(500, {
        status: false,
        error: err instanceof Error ? err.message : "Unknown error occurred"
      });
    }
})
.put("/change-booking-date/:userId/:bookingId", async ({ params, body }:{ params:{bookingId:string, userId:string}, body:{ bookingDate: string }}) => {
    try{
      const { bookingId, userId } = params;
      const { bookingDate } = body;
      if(!bookingDate){
        return error(400, {
          status: false,
          message: "Missing required parameters",
        })
      }
      const booking:{ bookingId:string, status:BookingStatus, paymentId: string, amount:number }[] = await prisma.$queryRaw`
        SELECT b.bookingId, b.status, p.paymentId, p.amount FROM booking b, payment p WHERE b.bookingId = ${bookingId} AND b.userId = ${userId} AND b.bookingId = p.bookingId
      `;
      if(booking.length == 0){
        return error(404, {
          status: false,
          message: "Booking not found",
        })
      }else if(booking.length != 1){
        return error(400,{
          status: false,
          message: "How did you get here!",
        })
      }else{
        // Update the booking record
        await prisma.$executeRaw`
          UPDATE booking SET bookingDate = STR_TO_DATE(${bookingDate}, '%Y-%m-%dT%H:%i:%s.%fZ') WHERE bookingId = ${bookingId}
        `
        return {
          status: true,
          message: "Booking date updated successfully",
          bookingId: booking[0].bookingId,
        }
      }
    }catch(err){
      console.error("Error fetching booking:", err);
      return error(500, {
        status: false,
        error: err instanceof Error ? err.message : "Unknown error occurred"
      });
    }
})
.delete("/delete/:userId/:bookingId", async ({ params }:{ params:{bookingId:string, userId:string}}) => {
    const { bookingId, userId } = params;
    if(!bookingId || !userId){
        return error(400, {
            status: false,
            message: "Missing required parameters",
        })
    }

    try {
        return await prisma.$transaction(async (tx) => {
            const booking: { bookingId: string }[] = await tx.$queryRaw`
                SELECT b.bookingId
                FROM booking b 
                WHERE b.bookingId = ${bookingId} 
                AND b.userId = ${userId} 
            `;
            
            if(booking.length == 0) {
                return error(404, {
                    status: false,
                    message: "Booking not found",
                });
            } else if(booking.length != 1) {
                return error(400, {
                    status: false,
                    message: "How did you get here!",
                });
            }
            
            // Delete records in the correct order (respecting foreign key constraints)
            await tx.$executeRaw`DELETE FROM booking_flight WHERE bookingId = ${bookingId}`;
            await tx.$executeRaw`DELETE FROM passenger_booking WHERE bookingId = ${bookingId}`;
            await tx.$executeRaw`DELETE FROM payment WHERE bookingId = ${bookingId}`;
            await tx.$executeRaw`DELETE FROM ticket WHERE bookingId = ${bookingId}`;
            await tx.$executeRaw`DELETE FROM booking WHERE bookingId = ${bookingId}`;
            
            return {
                status: true,
                message: "Booking deleted successfully",
                bookingId: booking[0].bookingId,
            };
        });
    } catch(err) {
      console.error("Error deleting booking:", err);
      return error(500, {
        status: false,
        error: err instanceof Error ? err.message : "Unknown error occurred"
      });
    }
})
.delete("/delete-passenger/:userId/:passportNum/:bookingId", async ({ params }:{ params:{passportNum:string, userId:string,bookingId: string}}) => {
  try{
    if(!params.passportNum || !params.userId || !params.bookingId){
      return error(400, {
        status: false,
        message: "Missing required parameters",
      })
    }
    // Check if the booking exists
    const booking:{ bookingId:string }[] = await prisma.$queryRaw`
      SELECT b.bookingId FROM booking b WHERE b.bookingId = ${params.bookingId} AND b.userId = ${params.userId} 
    `;
    if(booking.length == 0){
      return error(404, {
        status: false,
        message: "Booking not found",
      })
    }else if(booking.length != 1){
      return error(400,{
        status: false,
        message: "How did you get here!",
      })
    }else{
      //Check if the passenger exists
      const passenger:{ passportNum:string }[] = await prisma.$queryRaw`
        SELECT passportNum FROM passenger WHERE passportNum = ${params.passportNum} AND userId = ${params.userId}
      `;
      if(passenger.length == 0){
        return error(404, {
          status: false,
          message: "Passenger not found",
        })
      }
      // Delete the passenger_booking record
      await prisma.$executeRaw`
        DELETE FROM passenger_booking WHERE bookingId = ${params.bookingId} AND passportNum = ${params.passportNum}
      `
      // Delete the ticket record
      await prisma.$executeRaw`
        DELETE FROM ticket WHERE bookingId = ${params.bookingId} AND passportNum = ${params.passportNum} AND userId = ${params.userId}
      `
      return {
        status: true,
        message: "Passenger deleted successfully",
        bookingId: params.bookingId,
        passportNum: params.passportNum,
      }
    }
  }catch(err){
    console.error("Error deleting booking:", err);
    return error(500, {
      status: false,
      error: err instanceof Error ? err.message : "Unknown error occurred"
    });
  }
})
.delete("/delete-ticket/:userId/:ticketId", async ({ params }:{ params:{ticketId:string, userId:string}}) => {
  try{
    if(!params.ticketId || !params.userId){
      return error(400, {
        status: false,
        message: "Missing required parameters",
      })
    }
    // Check if the ticket exists
    const ticket:{ ticketId:string }[] = await prisma.$queryRaw`
      SELECT ticketId FROM ticket WHERE ticketId = ${params.ticketId} AND userId = ${params.userId}
    `;
    if(ticket.length == 0){
      return error(404, {
        status: false,
        message: "Ticket not found",
      })
    }
    // Delete the ticket record
    await prisma.$executeRaw`
      DELETE FROM ticket WHERE ticketId = ${params.ticketId} AND userId = ${params.userId}
    `
    return {
      status: true,
      message: "Ticket deleted successfully",
      ticketId: params.ticketId,
    }
  }catch(err){
    console.error("Error deleting ticket:", err);
    return error(500, {
      status: false,
      error: err instanceof Error ? err.message : "Unknown error occurred"
    });
  }
})
.delete("/delete-payment/:bookingId/:paymentId", async ({ params }:{ params:{paymentId:string, bookingId:string}}) => {
  try{
    if(!params.paymentId || !params.bookingId){
      return error(400, {
        status: false,
        message: "Missing required parameters",
      })
    }
    // Check if the payment exists
    const payment:{ paymentId:string }[] = await prisma.$queryRaw`
      SELECT paymentId FROM payment WHERE paymentId = ${params.paymentId} AND bookingId = ${params.bookingId}
    `;
    if(payment.length == 0){
      return error(404, {
        status: false,
        message: "Payment not found",
      })
    }
    // Delete the payment record
    await prisma.$executeRaw`
      DELETE FROM payment WHERE paymentId = ${params.paymentId} AND bookingId = ${params.bookingId}
    `
    return {
      status: true,
      message: "Payment deleted successfully",
      paymentId: params.paymentId,
    }
  }catch(err){
    console.error("Error deleting payment:", err);
    return error(500, {
      status: false,
      error: err instanceof Error ? err.message : "Unknown error occurred"
    });
  }
})
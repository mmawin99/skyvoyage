import Elysia, { error } from "elysia";

import { PrismaClient } from "../../prisma-client";
import { BookingStatus, BookingUserDetails, FareType, PassengerFillOut, PassengerTicket, searchSelectedBookingRoutes } from "@/types/type";
import { createUniversalFlightSchedule, stripePayment as stripe } from "@/server/lib";
import {BookingRow, FlightOperationRow, PassengerRow, TicketRow} from "@/types/booking"
import Stripe from "stripe";

const prisma = new PrismaClient()


export const adminQueryModule = new Elysia({
    prefix: '/query/admin',
})
.get("/booking/:size/:page", async ({ params }:{
    params:{
        page: number,
        size: number
    }
}) => {
    try {
      // Extract pagination parameters from query
      const page = Number(params.page) || 1;
      const size = Number(params.size) || 10;
      const offset = (page - 1) * size;
  
      // Fetch total count of bookings for pagination metadata
      const totalCount:{ count: number }[] = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM booking
      `;
      
      const total = Number(totalCount[0]?.count || 0);
      
      // Fetch paginated bookings
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
        ORDER BY b.bookingDate DESC
        LIMIT ${size} OFFSET ${offset}
      `;
  
      if (!bookings || bookings.length === 0) {
        return {
          success: true,
          data: [],
          pagination: {
            total,
            page,
            size
          }
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
        const user:BookingUserDetails[] = await prisma.$queryRaw`
          SELECT 
          firstname,
          lastname,
          email
          FROM user WHERE uuid = ${booking.userId}
        `
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
          userDetails: user.length > 0 ? {
            firstname: user[0].firstname,
            lastname: user[0].lastname,
            email: user[0].email
          } : undefined,
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
        booking: transformedBookings,
        pagination: {
          total,
          page,
          size,
          totalPages: Math.ceil(total / size)
        }
      };
    } catch (err) {
      console.error("Error fetching bookings:", err);
      return error(500, {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error occurred"
      });
    }
})
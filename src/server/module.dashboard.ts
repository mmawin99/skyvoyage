import { Elysia } from 'elysia';
import { getDateRange, getTimeInterval, sanitizeBigInt } from './lib'; // Assuming these helper functions are defined
import { PrismaClient } from "../../prisma-client";
import { AvgTicketPrice, BookingOverTime, BookingStats, PassengerDemographic, RecentFlight, RevenueByRoute, RPK, SeatUtilization, TopRoute, TotalRevenue } from '../types/dashboard'; // Assuming this is the correct path to your types
const prisma = new PrismaClient();

export const dashboardAdminModule = new Elysia({
    prefix: '/admin',
}).get('/overview', async ({ query }) => {
    try {
        const { start, end } = getDateRange(query);
        const interval = getTimeInterval(query);
        // 1. Total Bookings Over Time
        const bookingsOverTime:BookingOverTime[] = await prisma.$queryRaw`
        SELECT 
            DATE_FORMAT(b.bookingDate, ${interval}) AS timeInterval,
            COUNT(*) AS totalBookings
        FROM booking b
        WHERE b.bookingDate BETWEEN STR_TO_DATE(${start}, '%Y-%m-%dT%H:%i:%s.%fZ') AND STR_TO_DATE(${end}, '%Y-%m-%dT%H:%i:%s.%fZ')
        GROUP BY timeInterval
        ORDER BY timeInterval
        `;

        // 2.1 Total Revenue
        const totalRevenue:TotalRevenue[] = await prisma.$queryRaw`
            SELECT
                timeInterval,
                totalRevenue,
                CASE
                    WHEN LAG(totalRevenue) OVER (ORDER BY timeInterval) IS NULL 
                        OR LAG(totalRevenue) OVER (ORDER BY timeInterval) = 0
                        THEN 0
                    ELSE ROUND(
                        ((totalRevenue - LAG(totalRevenue) OVER (ORDER BY timeInterval))
                        / LAG(totalRevenue) OVER (ORDER BY timeInterval)) * 100, 2
                    )
                END AS percentChange
            FROM (
                SELECT
                    DATE_FORMAT(paymentDate, ${interval}) AS timeInterval,
                    SUM(amount) AS totalRevenue
                FROM payment
                WHERE paymentDate BETWEEN STR_TO_DATE(${start}, '%Y-%m-%dT%H:%i:%s.%fZ') AND STR_TO_DATE(${end}, '%Y-%m-%dT%H:%i:%s.%fZ')
                GROUP BY timeInterval
                ORDER BY timeInterval
            ) AS subquery;
        `;
        // 2. Revenue by Date and Route
        const revenueByRoute:RevenueByRoute[] = await prisma.$queryRaw`
        SELECT 
            DATE_FORMAT(b.bookingDate, ${interval}) AS timeInterval,
            f.departAirportId AS origin,
            f.arriveAirportId AS destination,
            SUM(t.ticketPrice + t.baggageAllowancePrice + t.mealPrice) AS revenue
        FROM ticket t
        JOIN flightOperate fo ON t.flightId = fo.flightId
        JOIN flight f ON f.flightNum = fo.flightNum AND fo.airlineCode = f.airlineCode
        JOIN booking b ON t.bookingId = b.bookingId
        WHERE b.bookingDate BETWEEN STR_TO_DATE(${start}, '%Y-%m-%dT%H:%i:%s.%fZ') AND STR_TO_DATE(${end}, '%Y-%m-%dT%H:%i:%s.%fZ')
        GROUP BY timeInterval, origin, destination
        ORDER BY timeInterval
        `;

        // 3. Booking Status Breakdown
        const bookingStatus:BookingStats[] = await prisma.$queryRaw`
        SELECT 
            b.status,
            COUNT(*) AS count
        FROM booking b
        WHERE b.bookingDate BETWEEN STR_TO_DATE(${start}, '%Y-%m-%dT%H:%i:%s.%fZ') AND STR_TO_DATE(${end}, '%Y-%m-%dT%H:%i:%s.%fZ')
        GROUP BY b.status
        `;

        // 4.2 Revenue Passenger Kilometers (RPK)
        const revenuePassengerKilometers:RPK[] = await prisma.$queryRaw`
            SELECT 
                fo.flightId,
                fo.flightNum,
                fo.airlineCode,
                fo.departureTime,
                fo.arrivalTime,
                -- Distance calculation using Haversine formula (kilometers)
                6371 * 
                ACOS(
                    COS(RADIANS(dep.latitude)) * 
                    COS(RADIANS(arr.latitude)) * 
                    COS(RADIANS(dep.longitude) - RADIANS(arr.longitude)) + 
                    SIN(RADIANS(dep.latitude)) * 
                    SIN(RADIANS(arr.latitude))
                ) AS distance_km,
                -- Count sold seats (tickets)
                (
                    SELECT 
                        COUNT(t.ticketId)
                    FROM 
                        ticket t
                    WHERE 
                        t.flightId = fo.flightId
                ) AS seats_sold,
                -- RPK calculation
                (
                    SELECT 
                        COUNT(t.ticketId)
                    FROM 
                        ticket t
                    WHERE 
                        t.flightId = fo.flightId
                ) * 
                (
                    6371 * 
                    ACOS(
                        COS(RADIANS(dep.latitude)) * 
                        COS(RADIANS(arr.latitude)) * 
                        COS(RADIANS(dep.longitude) - RADIANS(arr.longitude)) + 
                        SIN(RADIANS(dep.latitude)) * 
                        SIN(RADIANS(arr.latitude))
                    )
                ) AS RPK
            FROM 
                flightOperate fo
            JOIN 
                flight f ON fo.flightNum = f.flightNum AND fo.airlineCode = f.airlineCode
            JOIN 
                airport dep ON f.departAirportId = dep.airportCode
            JOIN 
                airport arr ON f.arriveAirportId = arr.airportCode
            WHERE 
                fo.departureTime BETWEEN STR_TO_DATE(${start}, '%Y-%m-%dT%H:%i:%s.%fZ') AND STR_TO_DATE(${end}, '%Y-%m-%dT%H:%i:%s.%fZ')
            ORDER BY 
                RPK DESC, fo.departureTime ASC
            LIMIT 10;
        `
        // 4.3 Seat Utilization
        const seatUtilization:SeatUtilization[] = await prisma.$queryRaw`
            SELECT 
                fo.flightId,
                fo.flightNum,
                fo.airlineCode,
                fo.departureTime,
                fo.arrivalTime,
                (
                    SELECT 
                        COUNT(s.seatId)
                    FROM 
                        aircraft ac
                    JOIN 
                        seatmap_info smi ON ac.seatMapId = smi.seatMapId
                    JOIN 
                        seat s ON smi.seatMapId = s.seatMapId
                    WHERE 
                        ac.aircraftId = fo.aircraftId
                ) AS total_seats,
                (
                    SELECT 
                        COUNT(t.ticketId)
                    FROM 
                        ticket t
                    WHERE 
                        t.flightId = fo.flightId
                ) AS seats_sold,
                CASE 
                    WHEN (
                        SELECT 
                            COUNT(s.seatId)
                        FROM 
                            aircraft ac
                        JOIN 
                            seatmap_info smi ON ac.seatMapId = smi.seatMapId
                        JOIN 
                            seat s ON smi.seatMapId = s.seatMapId
                        WHERE 
                            ac.aircraftId = fo.aircraftId
                    ) > 0 THEN 
                        (
                            (
                                SELECT 
                                    COUNT(t.ticketId)
                                FROM 
                                    ticket t
                                WHERE 
                                    t.flightId = fo.flightId
                            ) / 
                            (
                                SELECT 
                                    COUNT(s.seatId)
                                FROM 
                                    aircraft ac
                                JOIN 
                                    seatmap_info smi ON ac.seatMapId = smi.seatMapId
                                JOIN 
                                    seat s ON smi.seatMapId = s.seatMapId
                                WHERE 
                                    ac.aircraftId = fo.aircraftId
                            )
                        ) * 100
                    ELSE 0
                END AS seat_utilization_percentage
            FROM 
                flightOperate fo
            JOIN 
                flight f ON fo.flightNum = f.flightNum AND fo.airlineCode = f.airlineCode
            WHERE 
                fo.departureTime BETWEEN STR_TO_DATE(${start}, '%Y-%m-%dT%H:%i:%s.%fZ') AND STR_TO_DATE(${end}, '%Y-%m-%dT%H:%i:%s.%fZ')
            ORDER BY 
                seat_utilization_percentage DESC, fo.departureTime ASC
            LIMIT 10;
        `

        // 5. Top Routes by Booking Count
        const topRoutes:TopRoute[] = await prisma.$queryRaw`
            SELECT 
                f.departAirportId AS origin,
                f.arriveAirportId AS destination,
                COUNT(DISTINCT t.bookingId) AS bookingCount
            FROM flightOperate fo
            JOIN flight f ON f.flightNum = fo.flightNum AND fo.airlineCode = f.airlineCode
            JOIN ticket t ON fo.flightId = t.flightId
            WHERE fo.departureTime BETWEEN STR_TO_DATE(${start}, '%Y-%m-%dT%H:%i:%s.%fZ') AND STR_TO_DATE(${end}, '%Y-%m-%dT%H:%i:%s.%fZ')
            GROUP BY origin, destination
            ORDER BY bookingCount DESC
            LIMIT 10;
        `;

        // 6. Average Ticket Price by Route
        const avgTicketPrice:AvgTicketPrice[] = await prisma.$queryRaw`
        SELECT 
            f.departAirportId AS origin,
            f.arriveAirportId AS destination,
            AVG(t.ticketPrice + t.baggageAllowancePrice + t.mealPrice) AS averagePrice
        FROM flightOperate fo
        JOIN flight f ON f.flightNum = fo.flightNum AND fo.airlineCode = f.airlineCode
        JOIN ticket t ON fo.flightId = t.flightId
        WHERE fo.departureTime BETWEEN STR_TO_DATE(${start}, '%Y-%m-%dT%H:%i:%s.%fZ') AND STR_TO_DATE(${end}, '%Y-%m-%dT%H:%i:%s.%fZ')
        GROUP BY origin, destination
        `;

        // 7. Passenger Age Range & Nationality
        const passengerDemographics:PassengerDemographic[] = await prisma.$queryRaw`
        SELECT 
            p.ageRange,
            p.nationality,
            COUNT(DISTINCT p.passportNum) AS count
        FROM passenger p
        JOIN ticket t ON p.passportNum = t.passportNum AND p.userId = t.userId
        JOIN flightOperate f ON t.flightId = f.flightId
        WHERE f.departureTime BETWEEN STR_TO_DATE(${start}, '%Y-%m-%dT%H:%i:%s.%fZ') AND STR_TO_DATE(${end}, '%Y-%m-%dT%H:%i:%s.%fZ')
        GROUP BY p.ageRange, p.nationality
        ORDER BY count DESC
        `;
        //8. Recent Flights
        const recentFlights:RecentFlight[] = await prisma.$queryRaw`
            SELECT
            fo.airlineCode,
            fo.flightNum,
            IFNULL(SUM(t.ticketPrice + t.baggageAllowancePrice + t.mealPrice), 0) AS generatedRevenue,
            f.departAirportId AS departAirportCode,
            f.arriveAirportId AS arriveAirportCode,
            fo.departureTime,
            fo.arrivalTime,
            CASE
                WHEN NOW() < fo.departureTime THEN 'Upcoming'
                WHEN NOW() >= fo.departureTime AND NOW() < fo.arrivalTime THEN 'In-flight'
                WHEN NOW() >= fo.arrivalTime THEN 'Completed'
                ELSE 'Unknown'
            END AS status,
            LEAST(
                ABS(TIMESTAMPDIFF(SECOND, fo.departureTime, NOW())),
                ABS(TIMESTAMPDIFF(SECOND, fo.arrivalTime, NOW()))
            ) AS nearDiff
            FROM flightOperate fo
            JOIN flight f ON fo.flightNum = f.flightNum AND fo.airlineCode = f.airlineCode
            LEFT JOIN ticket t ON t.flightId = fo.flightId
            GROUP BY fo.flightId
            ORDER BY nearDiff ASC
            LIMIT 10;
        `;
        
        return {
            success: true,
            data: {
                recentFlights:sanitizeBigInt(recentFlights),
                bookingsOverTime:sanitizeBigInt(bookingsOverTime),
                totalRevenue:sanitizeBigInt(totalRevenue),
                revenueByRoute:sanitizeBigInt(revenueByRoute),
                bookingStatus:sanitizeBigInt(bookingStatus),
                seatUtilization:sanitizeBigInt(seatUtilization),
                revenuePassengerKilometers:sanitizeBigInt(revenuePassengerKilometers),
                topRoutes:sanitizeBigInt(topRoutes),
                avgTicketPrice:sanitizeBigInt(avgTicketPrice),
                passengerDemographics:sanitizeBigInt(passengerDemographics)
            }
        };
    } catch (err) {
        console.error('Admin Overview stats error:', err);
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Unknown error occurred'
        };
    }
},{
    detail:{
        description: 'Get the overview of the dashboard for admin',
        parameters: [
            {
                name: 'range',
                in: 'query',
                required: true,
                schema: {
                    type: 'string'
                },
                description: 'Time range (e.g. 30d, 2w, 4m, 1y, or yyyy-mm-dd,yyyy-mm-dd)'
            },
            {
                name: 'interval',
                in: 'query',
                required: true,
                schema: {
                    type: 'string',
                    enum: ['hour', 'day', 'week', 'month', 'quarter', 'year']
                },
                description: 'Interval for grouping data'
            }
        ]
    }
})
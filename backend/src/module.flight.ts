import { v4 as uuidv4 } from 'uuid'
import Elysia, { error, t } from "elysia";
import { PrismaClient} from "../prisma-client";
const prisma = new PrismaClient()
import modelAircraft from "../data/model_name.json"

interface SubmitSchedule {
    type: "recurring" | "single",
    flightNum: string,
    airlineCode: string,
    model: string,
    //For single flights
    registration?: string,
    departureDate?: string,
    arrivalDate?: string,
    //End for single flights
    //For recurring flights
    daysofweek?: string,
    startDate?: string,
    endDate?: string,
    depTime?: string,
    arrTime?: string,
    //End for recurring flights
}
interface FlightSchedule {
    flightId: string;
    flightNum: string;
    airlineCode: string;
    airlineName: string;
    departureTime: string;
    arrivalTime: string;
    aircraftModel: string;
    departureAirport: string;
    arrivalAirport: string;
    departTimezone: string;
    arriveTimezone: string;
    stopCount: number;
    estimatedDurationMinutes: number;
    estimatedPriceUSD: number;
}

interface FlightScheduleTransit1 {
    flightId1: string;
    flightNum1: string;
    airlineCode1: string;
    airlineName1: string;
    departureTime1: string;
    arrivalTime1: string;
    aircraftModel1: string;
    departureAirport: string;
    transitAirport: string;
    arrivalAirport: string;
    departTimezone: string;
    transitTimezone: string;
    arriveTimezone: string;
    flightId2: string;
    flightNum2: string;
    airlineCode2: string;
    airlineName2: string;
    departureTime2: string;
    arrivalTime2: string;
    aircraftModel2: string;
    stopCount: number;
    estimatedDurationMinutes: number;
    estimatedPriceUSD: number;
}



interface UniversalFlightSchedule {
    id: string;
    price: number;
    duration: number;
    stopCount: number;
    segments: {
        flightId: string;
        flightNum: string;
        airlineCode: string;
        airlineName: string;
        departureTime: string;
        arrivalTime: string;
        aircraftModel: string;
        departureAirport: string;
        arrivalAirport: string;
        departTimezone: string;
        arriveTimezone: string;
    }[];
    departureAirport: string;
    arrivalAirport: string;
}

function convertToUniversalFormat(
    directFlights: FlightSchedule[] = [], 
    transitFlights: FlightScheduleTransit1[] = []
): UniversalFlightSchedule[] {
    const universalFlights: UniversalFlightSchedule[] = [];
    
    // Convert direct flights
    for (const flight of directFlights) {
        universalFlights.push({
            id: flight.flightId,
            price: flight.estimatedPriceUSD,
            duration: flight.estimatedDurationMinutes,
            stopCount: flight.stopCount,
            segments: [
                {
                    flightId: flight.flightId,
                    flightNum: flight.flightNum,
                    airlineCode: flight.airlineCode,
                    airlineName: flight.airlineName,
                    departureTime: flight.departureTime,
                    arrivalTime: flight.arrivalTime,
                    aircraftModel: flight.aircraftModel,
                    departureAirport: flight.departureAirport,
                    arrivalAirport: flight.arrivalAirport,
                    departTimezone: flight.departTimezone,
                    arriveTimezone: flight.arriveTimezone
                }
            ],
            departureAirport: flight.departureAirport,
            arrivalAirport: flight.arrivalAirport
        });
    }
    
    // Convert transit flights
    for (const flight of transitFlights) {
        universalFlights.push({
            id: `${flight.flightId1}_${flight.flightId2}`,
            price: flight.estimatedPriceUSD,
            duration: flight.estimatedDurationMinutes,
            stopCount: flight.stopCount,
            segments: [
                {
                    flightId: flight.flightId1,
                    flightNum: flight.flightNum1,
                    airlineCode: flight.airlineCode1,
                    airlineName: flight.airlineName1,
                    departureTime: flight.departureTime1,
                    arrivalTime: flight.arrivalTime1,
                    aircraftModel: flight.aircraftModel1,
                    departureAirport: flight.departureAirport,
                    arrivalAirport: flight.transitAirport,
                    departTimezone: flight.departTimezone,
                    arriveTimezone: flight.transitTimezone
                },
                {
                    flightId: flight.flightId2,
                    flightNum: flight.flightNum2,
                    airlineCode: flight.airlineCode2,
                    airlineName: flight.airlineName2,
                    departureTime: flight.departureTime2,
                    arrivalTime: flight.arrivalTime2,
                    aircraftModel: flight.aircraftModel2,
                    departureAirport: flight.transitAirport,
                    arrivalAirport: flight.arrivalAirport,
                    departTimezone: flight.transitTimezone,
                    arriveTimezone: flight.arriveTimezone
                }
            ],
            departureAirport: flight.departureAirport,
            arrivalAirport: flight.arrivalAirport
        });
    }
    
    return universalFlights;
}



function sanitizeBigInt(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(sanitizeBigInt);
    } else if (obj instanceof Date) {
        return obj; // ✅ Keep Date as-is
    } else if (obj !== null && typeof obj === 'object') {
        const newObj: any = {};
        for (const key in obj) {
            const val = obj[key];
            newObj[key] =
                typeof val === 'bigint' ? val.toString() : sanitizeBigInt(val);
        }
        return newObj;
    }
    return obj;
}
const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
}
  
function chunkArray<T>(arr: T[], size: number): T[][] {
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size))
    }
    return result
}

function formatterSQLTIME(date: string): string {
    return date.replace('T', ' ').replace('Z', '')
}

export const flightModule = new Elysia({
        prefix: '/flight',
    })
    .post('/addSchedule', async ({ body }: { body: SubmitSchedule }) => {
        if (body.type !== 'recurring' && body.type !== 'single') {
            return {
                status: false,
                message: 'Unsupported schedule type',
            }
        }
    
        if(body.type === 'recurring'){
            const { flightNum, airlineCode, model, daysofweek, startDate, endDate, depTime, arrTime } = body
    
            if (!flightNum || !airlineCode || !model || !daysofweek || !startDate || !endDate || !depTime || !arrTime) {
                return {
                    status: false,
                    message: 'Missing required fields',
                }
            }
        
            try {
                const dayNumbers = daysofweek.split(',').map(d => dayMap[d.trim()])
            
                const aircrafts = await prisma.$queryRaw<
                    { aircraftId: string }[]
                >`SELECT aircraftId FROM aircraft WHERE ownerAirlineCode = ${airlineCode} AND model = ${model}`
            
                if (aircrafts.length === 0) {
                    return {
                        status: false,
                        message: 'No matching aircraft found',
                    }
                }
            
                const values: string[] = []
                const flightIds: string[] = []
            
                let dep = new Date(`${startDate}T00:00:00Z`)
                const end = new Date(`${endDate}T00:00:00Z`)
                const [depHour, depMin] = depTime.split(':').map(Number)
                const [arrHour, arrMin] = arrTime.split(':').map(Number)
            
                while (dep <= end) {
                    const day = dep.getUTCDay()
                    if (dayNumbers.includes(day)) {
                        const flightId = uuidv4()
                        const departureTime = new Date(Date.UTC(dep.getUTCFullYear(), dep.getUTCMonth(), dep.getUTCDate(), depHour, depMin))
                        const arrivalTime = new Date(departureTime)
                
                        arrivalTime.setUTCHours(arrHour, arrMin)
                        if (arrHour < depHour || (arrHour === depHour && arrMin < depMin)) {
                            arrivalTime.setUTCDate(arrivalTime.getUTCDate() + 1)
                        }
                
                        const gate = `${String.fromCharCode(97 + Math.floor(Math.random() * 6))}${Math.floor(Math.random() * 30) + 1}`
                        const aircraftId = aircrafts[Math.floor(Math.random() * aircrafts.length)].aircraftId
                
                        values.push(
                            `('${flightId}', '${flightNum}', '${airlineCode}', '${formatterSQLTIME(departureTime.toISOString())}', '${formatterSQLTIME(arrivalTime.toISOString())}', '${gate}', '${aircraftId}')`
                        )
                        flightIds.push(flightId)
                    }
            
                    dep.setUTCDate(dep.getUTCDate() + 1)
                }
        
                if (values.length > 0) {
                    const chunks = chunkArray(values, 1000)
                    try{

                        for (const chunk of chunks) {
                            const sql = `
                                INSERT INTO flightOperate (flightId, flightNum, airlineCode, departureTime, arrivalTime, departureGate, aircraftId)
                                VALUES ${chunk.join(",\n")}
                            `
                            await prisma.$executeRawUnsafe(sql)
                        }
                    }catch(err){
                        console.error(err)
                        return error(500, {
                            status: false,
                            message: 'Error inserting schedules',
                            error: err,
                        })
                    }
                }
        
                return {
                    status: true,
                    message: 'Schedules created',
                    count: flightIds.length,
                    schedules: flightIds,
                }
        
            } catch (err) {
                console.error(err)
                return error(500, {
                    status: false,
                    message: 'Internal server error',
                    error: err,
                })
            }
        }else if(body.type === 'single'){
            const { flightNum, airlineCode, model, registration, departureDate, arrivalDate } = body
    
            if (!flightNum || !airlineCode || !model || !registration || !departureDate || !arrivalDate) {
                return {
                    status: false,
                    message: 'Missing required fields',
                }
            }
        
            try {
            
                const flightId = uuidv4()
                const departureTime = new Date(departureDate)
                const arrivalTime = new Date(arrivalDate)
                
                const gate = `${String.fromCharCode(97 + Math.floor(Math.random() * 6))}${Math.floor(Math.random() * 30) + 1}`
                const aircraftId = registration
                
                try{
                    const sql = `
                    INSERT INTO flightOperate (flightId, flightNum, airlineCode, departureTime, arrivalTime, departureGate, aircraftId)
                    VALUES ('${flightId}', '${flightNum}', '${airlineCode}', '${formatterSQLTIME(departureTime.toISOString())}', '${formatterSQLTIME(arrivalTime.toISOString())}', '${gate}', '${aircraftId}')
                `
                
                await prisma.$executeRawUnsafe(sql)
                }catch(err){
                    console.error(err)
                    return error(500, {
                        status: false,
                        message: 'Error inserting schedule',
                        error: err,
                    })
                }
        
                return {
                    status: true,
                    message: 'Single schedule created',
                    schedule: flightId,
                }
        
            } catch (err) {
                console.error(err)
                return error(500, {
                    status: false,
                    message: 'Internal server error',
                    error: err,
                })
            }
        }
    })
    .get("/schedule", async ({body}:{body:{page:number,size:number, query: string}})=>{

    })
    .post("/flightList", async ({ body }:{
        body:{
            from: string,
            to: string,
            passengerCount: number,
            date: string,
            class: string,
            transitCount: 0 | 1 | 2
        }
    }) => {
        const {
            from: depAirport,
            to: arrAirport,
            passengerCount,
            date: depDate,
            class: flightClass,
            transitCount,
        } = body;
    
        if (!depAirport || !arrAirport || !passengerCount || !depDate || !flightClass || transitCount === undefined) {
            return error(400, {
                status: false,
                message: 'Missing required fields',
            });
        }
    
        try {
            let result: FlightSchedule[] = [];
            let result1: FlightScheduleTransit1[] = [];
    
            // Direct flights (0 stop)
            if (transitCount === 0) {
                result = await prisma.$queryRaw`
                SELECT
                    fo.flightId,
                    fo.flightNum,
                    a.airlineCode,
                    a.airlineName,
                    fo.departureTime,
                    fo.arrivalTime,
                    ac.model AS aircraftModel,
                    da.airportCode AS departureAirport,
                    aa.airportCode AS arrivalAirport,
                    da.timezone AS departTimezone,
                    aa.timezone AS arriveTimezone,
                    0 AS stopCount,
                    TIMESTAMPDIFF(MINUTE, fo.departureTime, fo.arrivalTime) AS estimatedDurationMinutes,
                    ABS(ROUND(
                    (
                        6371 * acos(
                        cos(radians(da.latitude)) * cos(radians(aa.latitude)) *
                        cos(radians(aa.longitude) - radians(da.longitude)) +
                        sin(radians(da.latitude)) * sin(radians(aa.latitude))
                        ) * 0.621371
                    ) * (acs.costPerMile / 71) / LEAST(2, 1 + (7 - DATEDIFF(fo.departureTime, CURDATE())) * 0.2),
                    2
                    )) AS estimatedPriceUSD
                FROM flightOperate fo
                JOIN flight f ON f.flightNum = fo.flightNum AND f.airlineCode = fo.airlineCode
                JOIN airline a ON a.airlineCode = f.airlineCode
                JOIN aircraft ac ON ac.aircraftId = fo.aircraftId
                JOIN aircraftCost acs ON ac.model = acs.model AND acs.ownerAirlineCode = a.airlineCode
                JOIN airport da ON f.departAirportId = da.airportCode
                JOIN airport aa ON f.arriveAirportId = aa.airportCode
                JOIN seatmap_info sm ON ac.seatMapId = sm.seatMapId
                JOIN seat s ON s.seatMapId = sm.seatMapId AND s.class = ${flightClass}
                LEFT JOIN ticket t ON t.seatId = s.seatId AND t.flightId = fo.flightId
                WHERE
                    f.departAirportId = ${depAirport}
                    AND f.arriveAirportId = ${arrAirport}
                    AND DATE(fo.departureTime) = ${depDate}
                GROUP BY fo.flightId
                HAVING COUNT(s.seatId) > COUNT(t.ticketId) AND COUNT(s.seatId) - COUNT(t.ticketId) > ${passengerCount};
                `;
                return {
                    status: true,
                    message: 'Flight list retrieved successfully',
                    data: convertToUniversalFormat(sanitizeBigInt(result)),
                };
            }else if (transitCount == 1) {
                result1 = await prisma.$queryRaw`
                    SELECT
                        fo1.flightId AS flightId1,
                        f1.flightNum AS flightNum1,
                        a1.airlineCode AS airlineCode1,
                        a1.airlineName AS airlineName1,
                        fo1.departureTime AS departureTime1,
                        fo1.arrivalTime AS arrivalTime1,
                        ac1.model AS aircraftModel1,
                        da.airportCode AS departureAirport,
                        ta.airportCode AS transitAirport,
                        aa.airportCode AS arrivalAirport,
                        da.timezone AS departTimezone,
                        ta.timezone AS transitTimezone,
                        aa.timezone AS arriveTimezone,
                        fo2.flightId AS flightId2,
                        f2.flightNum AS flightNum2,
                        a2.airlineCode AS airlineCode2,
                        a2.airlineName AS airlineName2,
                        fo2.departureTime AS departureTime2,
                        fo2.arrivalTime AS arrivalTime2,
                        ac2.model AS aircraftModel2,
                        1 AS stopCount,
                        TIMESTAMPDIFF(MINUTE, fo1.departureTime, fo1.arrivalTime) + 
                        TIMESTAMPDIFF(MINUTE, fo2.departureTime, fo2.arrivalTime) AS estimatedDurationMinutes,
                        ABS(ROUND(
                            (
                            6371 * acos(
                                cos(radians(da.latitude)) * cos(radians(ta.latitude)) *
                                cos(radians(ta.longitude) - radians(da.longitude)) +
                                sin(radians(da.latitude)) * sin(radians(ta.latitude))
                            ) * 0.621371
                            ) * (acs1.costPerMile / 71) / LEAST(2, 1 + (7 - DATEDIFF(fo1.departureTime, CURDATE())) * 0.2),
                            2
                        )) + 
                        ABS(ROUND(
                            (
                            6371 * acos(
                                cos(radians(ta.latitude)) * cos(radians(aa.latitude)) *
                                cos(radians(aa.longitude) - radians(ta.longitude)) +
                                sin(radians(ta.latitude)) * sin(radians(aa.latitude))
                            ) * 0.621371
                            ) * (acs2.costPerMile / 71) / LEAST(2, 1 + (7 - DATEDIFF(fo2.departureTime, CURDATE())) * 0.2),
                            2
                        )) AS estimatedPriceUSD
                    FROM 
                        /* First leg flight selection with filtering applied early */
                        (SELECT fo.* 
                        FROM flightOperate fo
                        JOIN flight f ON fo.flightNum = f.flightNum AND fo.airlineCode = f.airlineCode
                        WHERE f.departAirportId = ${depAirport} 
                        AND DATE(fo.departureTime) = ${depDate}
                        ) fo1
                    JOIN flight f1 ON fo1.flightNum = f1.flightNum AND fo1.airlineCode = f1.airlineCode
                    JOIN airline a1 ON a1.airlineCode = f1.airlineCode
                    JOIN aircraft ac1 ON ac1.aircraftId = fo1.aircraftId
                    JOIN aircraftCost acs1 ON ac1.model = acs1.model AND acs1.ownerAirlineCode = a1.airlineCode
                    JOIN airport da ON f1.departAirportId = da.airportCode
                    JOIN airport ta ON f1.arriveAirportId = ta.airportCode

                    /* Pre-filter transit options to reduce join overhead */
                    JOIN (
                        SELECT t.* 
                        FROM transit t
                        JOIN flight f_dep ON t.flightNumFrom = f_dep.flightNum AND t.airlineCodeFrom = f_dep.airlineCode
                        JOIN flight f_arr ON t.flightNumTo = f_arr.flightNum AND t.airlineCodeTo = f_arr.airlineCode
                        WHERE f_dep.departAirportId = ${depAirport}
                        AND f_arr.arriveAirportId = ${arrAirport}
                    ) t ON f1.flightNum = t.flightNumFrom AND f1.airlineCode = t.airlineCodeFrom

                    /* Second leg flight selection */
                    JOIN flight f2 ON t.flightNumTo = f2.flightNum AND t.airlineCodeTo = f2.airlineCode
                    JOIN (
                        SELECT fo.* 
                        FROM flightOperate fo
                        JOIN flight f ON fo.flightNum = f.flightNum AND fo.airlineCode = f.airlineCode
                        WHERE f.arriveAirportId = ${arrAirport}
                        AND DATE(fo.departureTime) IN (${depDate}, DATE_ADD(${depDate}, INTERVAL 1 DAY))
                    ) fo2 ON fo2.flightNum = f2.flightNum AND fo2.airlineCode = f2.airlineCode
                    JOIN airline a2 ON a2.airlineCode = f2.airlineCode
                    JOIN aircraft ac2 ON ac2.aircraftId = fo2.aircraftId
                    JOIN aircraftCost acs2 ON ac2.model = acs2.model AND acs2.ownerAirlineCode = a2.airlineCode
                    JOIN airport aa ON f2.arriveAirportId = aa.airportCode

                    /* Seat availability for first flight */
                    JOIN (
                        SELECT 
                            sm.seatMapId,
                            COUNT(DISTINCT s.seatId) AS totalSeats,
                            s.class
                        FROM seatmap_info sm
                        JOIN seat s ON s.seatMapId = sm.seatMapId
                        WHERE s.class = ${flightClass}
                        GROUP BY sm.seatMapId, s.class
                    ) AS seat_info1 ON ac1.seatMapId = seat_info1.seatMapId
                    LEFT JOIN (
                        SELECT 
                            t.flightId,
                            COUNT(DISTINCT t.ticketId) AS bookedSeats
                        FROM ticket t
                        JOIN seat s ON t.seatId = s.seatId
                        WHERE s.class = ${flightClass}
                        GROUP BY t.flightId
                    ) AS ticket_info1 ON fo1.flightId = ticket_info1.flightId

                    /* Seat availability for second flight */
                    JOIN (
                        SELECT 
                            sm.seatMapId,
                            COUNT(DISTINCT s.seatId) AS totalSeats,
                            s.class
                        FROM seatmap_info sm
                        JOIN seat s ON s.seatMapId = sm.seatMapId
                        WHERE s.class = ${flightClass}
                        GROUP BY sm.seatMapId, s.class
                    ) AS seat_info2 ON ac2.seatMapId = seat_info2.seatMapId
                    LEFT JOIN (
                        SELECT 
                            t.flightId,
                            COUNT(DISTINCT t.ticketId) AS bookedSeats
                        FROM ticket t
                        JOIN seat s ON t.seatId = s.seatId
                        WHERE s.class = ${flightClass}
                        GROUP BY t.flightId
                    ) AS ticket_info2 ON fo2.flightId = ticket_info2.flightId

                    WHERE
                        fo2.departureTime BETWEEN fo1.arrivalTime + INTERVAL 1 HOUR AND fo1.arrivalTime + INTERVAL 8 HOUR
                        AND (seat_info1.totalSeats - COALESCE(ticket_info1.bookedSeats, 0)) > ${passengerCount}
                        AND (seat_info2.totalSeats - COALESCE(ticket_info2.bookedSeats, 0)) > ${passengerCount}
                    GROUP BY fo1.flightId, fo2.flightId
                    ORDER BY estimatedDurationMinutes, estimatedPriceUSD
                    LIMIT 100;
                `;
                return {
                    status: true,
                    message: 'Flight list retrieved successfully',
                    data: convertToUniversalFormat([], sanitizeBigInt(result1)),
                }
            }else if(transitCount == 2){

            }
    

        } catch (err) {
            console.error('Flight query error:', err);
            return error(500, {
                status: false,
                message: 'Internal server error',
                error: err,
            });
        }
    });
import { v4 as uuidv4 } from 'uuid'
import Elysia, { error } from "elysia";
// import modelAircraft from "../../data/model_name.json"
import { sanitizeBigInt } from './lib';
import { PrismaClient } from "../../prisma-client";

const prisma = new PrismaClient()

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
    price: {
        SUPER_SAVER: number;
        SAVER: number;
        STANDARD: number;
        FLEXI: number;
        FULL_FLEX: number;
    };
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

interface ScheduleListAdmin{
    flightId: string
    flightNum: string
    airlineCode: string
    airlineName: string
    departureTime: Date
    arrivalTime: Date
    aircraftId: string
    departAirportId: string
    departureAirport: string
    arriveAirportId: string
    arrivalAirport: string
    aircraftModel: string
}

type FareType = "SUPER_SAVER" | "SAVER" | "STANDARD" | "FLEXI" | "FULL_FLEX"

function calculatePrice(flightClass: string, basePrice: number): number {
    const classMultiplier: Record<string, number> = {
        Y: 1.1333,
        W: 1.3333,
        C: 1.5533,
        F: 2.1333,
    };
    const multiplier = classMultiplier[flightClass] || 1;
    return Math.round(basePrice * multiplier);
}

const cabinClassPrice = (price:number, cabinClass: "Y" | "F" | "C" | "W" , FarePackage: FareType)=>{
    if(cabinClass === "Y"){
        switch(FarePackage){
            case "SUPER_SAVER":
                return price
            case "SAVER":
                return price + 50
            case "STANDARD":
                return price + 100
            case "FLEXI":
                return price + 150
            case "FULL_FLEX":
                return price + 200
            default:
                return price
        }
    }else if(cabinClass === "W"){
        switch(FarePackage){
            case "SUPER_SAVER":
                return -1
            case "SAVER":
                return price
            case "STANDARD":
                return price + 50
            case "FLEXI":
                return price + 100
            case "FULL_FLEX":
                return price + 150
            default:
                return price
        }
    }else if(cabinClass === "C"){
        switch(FarePackage){
            case "SUPER_SAVER":
                return -1
            case "SAVER":
                return -1
            case "STANDARD":
                return -1
            case "FLEXI":
                return price
            case "FULL_FLEX":
                return price + 125
            default:
                return price
        }
    }else if(cabinClass === "F"){
        switch(FarePackage){
            case "SUPER_SAVER":
                return -1
            case "SAVER":
                return -1
            case "STANDARD":
                return -1
            case "FLEXI":
                return price + 100
            case "FULL_FLEX":
                return price + 200
            default:
                return price
        }
    }
    return -1
}
function convertToUniversalFormat(
    flightClass: string,
    directFlights: FlightSchedule[] = [], 
    transitFlights: FlightScheduleTransit1[] = []
): UniversalFlightSchedule[] {
    const universalFlights: UniversalFlightSchedule[] = [];
    
    // Convert direct flights
    for (const flight of directFlights) {
        universalFlights.push({
            id: flight.flightId,
            price: {
                SUPER_SAVER: cabinClassPrice(calculatePrice(flightClass,parseInt(String(flight.estimatedPriceUSD))), flightClass as "Y" | "C" | "W" | "F", "SUPER_SAVER"),
                SAVER: cabinClassPrice(calculatePrice(flightClass,parseInt(String(flight.estimatedPriceUSD))), flightClass as "Y" | "C" | "W" | "F", "SAVER"),
                STANDARD: cabinClassPrice(calculatePrice(flightClass,parseInt(String(flight.estimatedPriceUSD))), flightClass as "Y" | "C" | "W" | "F", "STANDARD"),
                FLEXI: cabinClassPrice(calculatePrice(flightClass,parseInt(String(flight.estimatedPriceUSD))), flightClass as "Y" | "C" | "W" | "F", "FLEXI"),
                FULL_FLEX: cabinClassPrice(calculatePrice(flightClass,parseInt(String(flight.estimatedPriceUSD))), flightClass as "Y" | "C" | "W" | "F", "FULL_FLEX")
            },
            duration: parseInt(String(flight.estimatedDurationMinutes)),
            stopCount: parseInt(String(flight.stopCount)),
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
            price: {
                SUPER_SAVER: cabinClassPrice(calculatePrice(flightClass,parseInt(String(flight.estimatedPriceUSD))), flightClass as "Y" | "C" | "W" | "F", "SUPER_SAVER"),
                SAVER: cabinClassPrice(calculatePrice(flightClass,parseInt(String(flight.estimatedPriceUSD))), flightClass as "Y" | "C" | "W" | "F", "SAVER"),
                STANDARD: cabinClassPrice(calculatePrice(flightClass,parseInt(String(flight.estimatedPriceUSD))), flightClass as "Y" | "C" | "W" | "F", "STANDARD"),
                FLEXI: cabinClassPrice(calculatePrice(flightClass,parseInt(String(flight.estimatedPriceUSD))), flightClass as "Y" | "C" | "W" | "F", "FLEXI"),
                FULL_FLEX: cabinClassPrice(calculatePrice(flightClass,parseInt(String(flight.estimatedPriceUSD))), flightClass as "Y" | "C" | "W" | "F", "FULL_FLEX")
            },
            duration: parseInt(String(flight.estimatedDurationMinutes)),
            stopCount: parseInt(String(flight.stopCount)),
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
            
                const dep = new Date(`${startDate}T00:00:00Z`)
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
    .post("/schedule/:size/:kind/:page", async ({params,body}:{params:{ query: string, size:number, page:number, kind:"all" | "upcoming" | "inflight" | "completed" }, body:{query:string}})=>{
        const timeStart = Date.now()
        const { size, page, kind} = params
        const { query } = body
        if(!size || !page){
            return error(400, {
                status: false,
                message: 'Missing required fields',
            })
        }
        const offset = (page - 1) * size
        const limit = size
        let result: ScheduleListAdmin[] = []
        let totalCount: { count: number }[] = []
        try {
            
            if(!query){
                // Initialize the base query parts
                let queryString = `
                    SELECT 
                        fo.flightId,
                        fo.flightNum,
                        fo.airlineCode,
                        a.airlineName,
                        fo.departureTime,
                        fo.arrivalTime,
                        fo.aircraftId,
                        f.departAirportId,
                        da.name AS departureAirport,
                        f.arriveAirportId,
                        aa.name AS arrivalAirport,
                        ac.model AS aircraftModel
                    FROM flightOperate fo
                    JOIN flight f ON f.flightNum = fo.flightNum AND f.airlineCode = fo.airlineCode
                    JOIN aircraft ac ON ac.aircraftId = fo.aircraftId
                    JOIN airport da ON f.departAirportId = da.airportCode
                    JOIN airport aa ON f.arriveAirportId = aa.airportCode
                    JOIN airline a ON a.airlineCode = f.airlineCode`;
                
                // Add WHERE clause based on kind
                if (kind === "upcoming") {
                    queryString += ` WHERE fo.departureTime > NOW()`;
                } else if (kind === "inflight") {
                    queryString += ` WHERE fo.departureTime <= NOW() AND fo.arrivalTime >= NOW()`;
                } else if (kind === "completed") {
                    queryString += ` WHERE fo.arrivalTime < NOW()`;
                }
                
                // Add ordering and pagination
                queryString += ` ORDER BY fo.departureTime ASC LIMIT ${limit} OFFSET ${offset}`;
                
                // Execute the query
                result = await prisma.$queryRawUnsafe(queryString);
                
                // Count query
                let countQueryString = `
                    SELECT COUNT(*) AS count 
                    FROM flightOperate fo`;
                    
                // Add same WHERE clause to count query
                if (kind === "upcoming") {
                    countQueryString += ` WHERE fo.departureTime > NOW()`;
                } else if (kind === "inflight") {
                    countQueryString += ` WHERE fo.departureTime <= NOW() AND fo.arrivalTime >= NOW()`;
                } else if (kind === "completed") {
                    countQueryString += ` WHERE fo.arrivalTime < NOW()`;
                }
                
                totalCount = await prisma.$queryRawUnsafe(countQueryString);
            } else {
                // Build search query with wildcard
                const wildcardValue = `%${query}%`; // Assuming 'wildcard' was derived from 'query'
                
                let queryString = `
                    SELECT 
                        fo.flightId,
                        fo.flightNum,
                        fo.airlineCode,
                        a.airlineName,
                        fo.departureTime,
                        fo.arrivalTime,
                        fo.aircraftId,
                        f.departAirportId,
                        da.name AS departureAirport,
                        f.arriveAirportId,
                        aa.name AS arrivalAirport,
                        ac.model AS aircraftModel
                    FROM flightOperate fo
                    JOIN flight f ON f.flightNum = fo.flightNum AND f.airlineCode = fo.airlineCode
                    JOIN aircraft ac ON ac.aircraftId = fo.aircraftId
                    JOIN airport da ON f.departAirportId = da.airportCode
                    JOIN airport aa ON f.arriveAirportId = aa.airportCode
                    JOIN airline a ON a.airlineCode = f.airlineCode
                    WHERE (
                        fo.flightId LIKE '${wildcardValue}'
                        OR fo.flightNum LIKE '${wildcardValue}'
                        OR f.departAirportId LIKE '${wildcardValue}'
                        OR f.arriveAirportId LIKE '${wildcardValue}'
                        OR da.name LIKE '${wildcardValue}'
                        OR aa.name LIKE '${wildcardValue}'
                        OR da.city LIKE '${wildcardValue}'
                        OR aa.city LIKE '${wildcardValue}'
                        OR ac.model LIKE '${wildcardValue}'
                        OR ac.aircraftId LIKE '${wildcardValue}'
                        OR f.airlineCode LIKE '${wildcardValue}'
                    )`;
                
                // Add time filter if specified
                if (kind === "upcoming") {
                    queryString += ` AND fo.departureTime > NOW()`;
                } else if (kind === "inflight") {
                    queryString += ` AND fo.departureTime <= NOW() AND fo.arrivalTime >= NOW()`;
                } else if (kind === "completed") {
                    queryString += ` AND fo.arrivalTime < NOW()`;
                }
                
                // Add ordering and pagination
                queryString += ` ORDER BY fo.departureTime ASC LIMIT ${limit} OFFSET ${offset}`;
                
                // Execute the query
                result = await prisma.$queryRawUnsafe(queryString);
                
                // Count query with the same conditions but without ordering and pagination
                let countQueryString = `
                    SELECT COUNT(*) AS count 
                    FROM flightOperate fo
                    JOIN flight f ON f.flightNum = fo.flightNum AND f.airlineCode = fo.airlineCode
                    JOIN aircraft ac ON ac.aircraftId = fo.aircraftId
                    JOIN airport da ON f.departAirportId = da.airportCode
                    JOIN airport aa ON f.arriveAirportId = aa.airportCode
                    JOIN airline a ON a.airlineCode = f.airlineCode
                    WHERE (
                        fo.flightId LIKE '${wildcardValue}'
                        OR fo.flightNum LIKE '${wildcardValue}'
                        OR f.departAirportId LIKE '${wildcardValue}'
                        OR f.arriveAirportId LIKE '${wildcardValue}'
                        OR da.name LIKE '${wildcardValue}'
                        OR aa.name LIKE '${wildcardValue}'
                        OR da.city LIKE '${wildcardValue}'
                        OR aa.city LIKE '${wildcardValue}'
                        OR ac.model LIKE '${wildcardValue}'
                        OR ac.aircraftId LIKE '${wildcardValue}'
                        OR f.airlineCode LIKE '${wildcardValue}'
                    )`;
                
                // Add the same time filter to count query
                if (kind === "upcoming") {
                    countQueryString += ` AND fo.departureTime > NOW()`;
                } else if (kind === "inflight") {
                    countQueryString += ` AND fo.departureTime <= NOW() AND fo.arrivalTime >= NOW()`;
                } else if (kind === "completed") {
                    countQueryString += ` AND fo.arrivalTime < NOW()`;
                }
                
                totalCount = await prisma.$queryRawUnsafe(countQueryString);
            }
            const timeEnd = Date.now()
            if (result.length === 0) {
                return {
                    status: false,
                    message: 'No schedules found',
                    totalCount: 0,
                    page: page,
                    size: size,
                    data: [],
                    timeUsed: timeEnd - timeStart,
                }
            }
            return {
                status: true,
                message: 'Schedules retrieved successfully',
                totalCount: sanitizeBigInt(totalCount)[0].count,
                page: page,
                size: size,
                data: sanitizeBigInt(result),
                timeUsed: timeEnd - timeStart,
            }
        } catch (err) {
            console.error(err)
            return error(500, {
                status: false,
                message: 'Internal server error',
                error: err,
            })
        }
    })
    .post("/flightList", async ({ body }:{
        body:{
            from: string,
            to: string,
            passengerCount: number,
            date: string,
            class: string,
            transitCount: 0 | 1 
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
                            ) * (acs.costPerMile / 71) * 
                            CASE 
                                WHEN DATEDIFF(fo.departureTime, CURDATE()) <= 1 THEN 2
                                WHEN DATEDIFF(fo.departureTime, CURDATE()) <= 3 THEN 1.8
                                WHEN DATEDIFF(fo.departureTime, CURDATE()) <= 5 THEN 1.6
                                WHEN DATEDIFF(fo.departureTime, CURDATE()) <= 7 THEN 1.4
                                WHEN DATEDIFF(fo.departureTime, CURDATE()) <= 9 THEN 1.2
                                ELSE 1
                            END,
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
                    LEFT JOIN booking b ON t.bookingId = b.bookingId
                    WHERE
                        f.departAirportId = ${depAirport}
                        AND f.arriveAirportId = ${arrAirport}
                        AND DATE(fo.departureTime) = ${depDate}
                    GROUP BY fo.flightId
                    HAVING COUNT(s.seatId) > COUNT(CASE WHEN t.ticketId IS NOT NULL AND (b.status = 'PAID' OR b.status = 'UNPAID') THEN 1 ELSE NULL END) 
                    AND COUNT(s.seatId) - COUNT(CASE WHEN t.ticketId IS NOT NULL AND (b.status = 'PAID' OR b.status = 'UNPAID') THEN 1 ELSE NULL END) > ${passengerCount};
                `;
                return {
                    status: true,
                    message: 'Flight list retrieved successfully',
                    data: convertToUniversalFormat(flightClass, sanitizeBigInt(result)),
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
                                ) * (acs1.costPerMile / 71) * CASE 
                                    WHEN DATEDIFF(fo1.departureTime, CURDATE()) <= 1 THEN 2 
                                    WHEN DATEDIFF(fo1.departureTime, CURDATE()) <= 3 THEN 1.8 
                                    WHEN DATEDIFF(fo1.departureTime, CURDATE()) <= 5 THEN 1.6 
                                    WHEN DATEDIFF(fo1.departureTime, CURDATE()) <= 7 THEN 1.4 
                                    WHEN DATEDIFF(fo1.departureTime, CURDATE()) <= 9 THEN 1.2 
                                    ELSE 1 
                                END,
                                2
                            )) + 
                            ABS(ROUND(
                                (
                                6371 * acos(
                                    cos(radians(ta.latitude)) * cos(radians(aa.latitude)) *
                                    cos(radians(aa.longitude) - radians(ta.longitude)) +
                                    sin(radians(ta.latitude)) * sin(radians(aa.latitude))
                                ) * 0.621371
                                ) * (acs2.costPerMile / 71) * CASE 
                                    WHEN DATEDIFF(fo2.departureTime, CURDATE()) <= 1 THEN 2 
                                    WHEN DATEDIFF(fo2.departureTime, CURDATE()) <= 3 THEN 1.8 
                                    WHEN DATEDIFF(fo2.departureTime, CURDATE()) <= 5 THEN 1.6 
                                    WHEN DATEDIFF(fo2.departureTime, CURDATE()) <= 7 THEN 1.4 
                                    WHEN DATEDIFF(fo2.departureTime, CURDATE()) <= 9 THEN 1.2 
                                    ELSE 1 
                                END,
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
                            JOIN booking b ON t.bookingId = b.bookingId
                            WHERE s.class = ${flightClass}
                            AND (b.status = 'PAID' OR b.status = 'UNPAID')
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
                            JOIN booking b ON t.bookingId = b.bookingId
                            WHERE s.class = ${flightClass}
                            AND (b.status = 'PAID' OR b.status = 'UNPAID')
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
                    data: convertToUniversalFormat(flightClass, [], sanitizeBigInt(result1)),
                }
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
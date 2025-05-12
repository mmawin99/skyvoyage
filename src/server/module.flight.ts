import { v4 as uuidv4 } from 'uuid'
import Elysia, { error } from "elysia";
// import modelAircraft from "../../data/model_name.json"
import { sanitizeBigInt, sanitizeStringForSql } from "@/server/lib";
import { airline, flight as Flight, PrismaClient } from "../../prisma-client";
import { adminFlightListType, adminTransitListType, FareType, ScheduleListAdmin, SubmitAircraft, SubmitAirline, SubmitAirport, SubmitSchedule, SubmitTransit, UniversalFlightSchedule } from '@/types/type';
import { SubmitFlight } from '@/types/type';

const prisma = new PrismaClient()


export interface FlightSchedule {
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

export interface FlightScheduleTransit1 {
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


function calculatePrice(flightClass: string, basePrice: number): number {
    const classMultiplier: Record<string, number> = {
        Y: 0.8333,
        W: 1.1333,
        C: 1.7333,
        F: 2.5333,
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
    .put("/editSchedule/:scheduleId", async ({params, body}:{params:{scheduleId:string}, body:SubmitSchedule})=>{
        const { scheduleId } = params
        const { arrivalDate , departureDate } = body
        if (!arrivalDate || !departureDate) {
            return error(400, {
                status: false,
                message: 'Missing required fields',
            })
        }
        try{
            await prisma.$executeRaw`
                UPDATE flightOperate 
                SET  
                departureTime = ${formatterSQLTIME(departureDate)}, arrivalTime = ${formatterSQLTIME(arrivalDate)}
                WHERE flightId = ${scheduleId}
            `
            return {
                status: true,
                message: 'Schedule updated successfully',
            }
        }catch(err){
            console.error(err)
            return error(500, {
                status: false,
                message: 'Internal server error',
                error: err,
            })
        }
    })
    .delete("/deleteSchedule/:scheduleId", async ({params}:{params:{scheduleId:string}})=>{
        const { scheduleId } = params
        
        if (!scheduleId) {
            return error(400, {
                status: false,
                message: 'Missing required fields',
            })
        }
        
        try {
            // Start a transaction to ensure all operations succeed or fail together
            return await prisma.$transaction(async (tx) => {
                // 1. Find all affected bookings
                const affectedBookingFlights = await tx.$queryRaw<{ bookingId: string; flightId: string }[]>`
                    SELECT bookingId, flightId 
                    FROM booking_flight
                    WHERE flightId = ${scheduleId}
                `;
                
                const bookingIds = [...new Set(affectedBookingFlights.map(bf => bf.bookingId))];
                
                // 2. Delete tickets first
                await tx.$executeRaw`
                    DELETE FROM ticket
                    WHERE flightId = ${scheduleId}
                `;
                
                // 3. Delete booking_flight entries
                await tx.$executeRaw`
                    DELETE FROM booking_flight
                    WHERE flightId = ${scheduleId}
                `;
                
                // 4. For each affected booking, check if it has any remaining flights
                for (const bookingId of bookingIds) {
                    const remainingFlights = await tx.$queryRaw<[{count: bigint}]>`
                        SELECT COUNT(*) as count
                        FROM booking_flight
                        WHERE bookingId = ${bookingId}
                    `;
                    
                    // If no flights left in this booking, delete the entire booking chain
                    if (remainingFlights[0].count === BigInt(0)) {
                        // Delete passenger_booking records
                        await tx.$executeRaw`
                            DELETE FROM passenger_booking
                            WHERE bookingId = ${bookingId}
                        `;
                        
                        // Delete payment if exists
                        await tx.$executeRaw`
                            DELETE FROM payment
                            WHERE bookingId = ${bookingId}
                        `;
                        
                        // Finally delete the booking itself
                        await tx.$executeRaw`
                            DELETE FROM booking
                            WHERE bookingId = ${bookingId}
                        `;
                    }
                }
                
                // 5. Finally delete the flightOperate record
                await tx.$executeRaw`
                    DELETE FROM flightOperate 
                    WHERE flightId = ${scheduleId}
                `;
                
                return {
                    status: true,
                    message: 'Schedule and all related data deleted successfully',
                };
            });
        } catch (err) {
            console.error(err);
            return error(500, {
                status: false,
                message: 'Internal server error',
                error: err,
            });
        }
    })
    .post("/addFlight", async({body}:{body:SubmitFlight})=>{
        try{

            const { flightNum, airlineCode, departAirportId, arriveAirportId, departureTime, arrivalTime } = body
            
            if (!flightNum || !airlineCode || !departAirportId || !arriveAirportId || !departureTime || !arrivalTime) {
                return error(400, {
                    status: false,
                    message: 'Missing required fields',
                })
            }
            
            await prisma.$executeRaw`
                INSERT INTO flight (flightNum, airlineCode, departAirportId, arriveAirportId, departureTime, arrivalTime) 
                VALUES (${flightNum}, ${airlineCode}, ${departAirportId}, ${arriveAirportId}, ${departureTime}, ${arrivalTime})
            `
            return {
                status: true,
                message: 'Flight added successfully',
            }
        }catch(err){
            console.error(err)
            return error(500, {
                status: false,
                message: 'Internal server error',
                error: err,
            })
        }

    })
    .put("/editFlight", async({body}:{body:SubmitFlight})=>{
        try{
            const { flightNum, airlineCode, departAirportId, arriveAirportId, departureTime, arrivalTime } = body
            
            if (!flightNum || !airlineCode || !departAirportId || !arriveAirportId || !departureTime || !arrivalTime) {
                return error(400, {
                    status: false,
                    message: 'Missing required fields',
                })
            }
            //Check flight exists
            const flightExists:Flight[] = await prisma.$queryRaw`
                SELECT * FROM flight 
                WHERE flightNum = ${flightNum} AND airlineCode = ${airlineCode}
            `

            if (flightExists.length === 0) {
                return error(404, {
                    status: false,
                    message: 'Flight not found',
                })
            }

            await prisma.$executeRaw`
                UPDATE flight 
                SET departureTime = ${departureTime}, arrivalTime = ${arrivalTime} 
                WHERE flightNum = ${flightNum} AND airlineCode = ${airlineCode}
            `
            return {
                status: true,
                message: 'Flight updated successfully',
            }
        }catch(err){
            console.error(err)
            return error(500, {
                status: false,
                message: 'Internal server error',
                error: err,
            })
        }
    })
    .post("/addAircraft", async({body}:{body:SubmitAircraft})=>{
        try{
            const { ownerAirlineCode, model, aircraftId, seatMapId } = body
            
            if (!ownerAirlineCode || !model || !aircraftId || !seatMapId) {
                return error(400, {
                    status: false,
                    message: 'Missing required fields',
                })
            }
            
            await prisma.$executeRaw`
                INSERT INTO aircraft (ownerAirlineCode, model, aircraftId, seatMapId) 
                VALUES (${ownerAirlineCode}, ${model}, ${aircraftId}, ${seatMapId})
            `
            return {
                status: true,
                message: 'Aircraft added successfully',
            }
        }catch(err){
            console.error(err)
            return error(500, {
                status: false,
                message: 'Internal server error',
                error: err,
            })
        }
    })
    .post("/addTransit", async({body}:{body:SubmitTransit})=>{
        try{
            const { flightNumFrom, flightNumTo, airlineCodeFrom, airlineCodeTo } = body
            if (!flightNumFrom || !flightNumTo || !airlineCodeFrom || !airlineCodeTo) {
                return error(400, {
                    status: false,
                    message: 'Missing required fields',
                })
            }
            await prisma.$executeRaw`
                INSERT INTO transit (flightNumFrom, flightNumTo, airlineCodeFrom, airlineCodeTo) 
                VALUES (${flightNumFrom}, ${flightNumTo}, ${airlineCodeFrom}, ${airlineCodeTo})
            `
            return {
                status: true,
                message: 'Transit added successfully',
            }
        }catch(err){
            console.error(err)
            return error(500, {
                status: false,
                message: 'Internal server error',
                error: err,
            })
        }
    })
    .put("/editTransit", async({body:{old, new:newTransit}}:{body:{old:SubmitTransit,new:SubmitTransit}})=>{
        try{
            const { flightNumFrom, flightNumTo, airlineCodeFrom, airlineCodeTo } = old
            if (!flightNumFrom || !flightNumTo || !airlineCodeFrom || !airlineCodeTo) {
                return error(400, {
                    status: false,
                    message: 'Missing required fields',
                })
            }
            //Check transit exists
            const transitExists:adminTransitListType[] = await prisma.$queryRaw`
                SELECT * FROM transit 
                WHERE flightNumFrom = ${flightNumFrom} AND flightNumTo = ${flightNumTo} AND airlineCodeFrom = ${airlineCodeFrom} AND airlineCodeTo = ${airlineCodeTo}
            `

            if (transitExists.length === 0) {
                return error(404, {
                    status: false,
                    message: 'Transit not found',
                })
            }

            await prisma.$executeRaw`
                UPDATE transit 
                SET flightNumFrom = ${newTransit.flightNumFrom}, flightNumTo = ${newTransit.flightNumTo}, airlineCodeFrom = ${newTransit.airlineCodeFrom}, airlineCodeTo = ${newTransit.airlineCodeTo} 
                WHERE flightNumFrom = ${flightNumFrom} AND flightNumTo = ${flightNumTo} AND airlineCodeFrom = ${airlineCodeFrom} AND airlineCodeTo = ${airlineCodeTo}
            `
            return {
                status: true,
                message: 'Transit updated successfully',
            }
        }catch(err){
            console.error(err)
            return error(500, {
                status: false,
                message: 'Internal server error',
                error: err,
            })
        }
    })
    .delete("/deleteTransit", async({body}:{body:SubmitTransit})=>{
         try{
            const { flightNumFrom, flightNumTo, airlineCodeFrom, airlineCodeTo } = body
            if (!flightNumFrom || !flightNumTo || !airlineCodeFrom || !airlineCodeTo) {
                return error(400, {
                    status: false,
                    message: 'Missing required fields',
                })
            }
            //Check transit exists
            const transitExists:adminTransitListType[] = await prisma.$queryRaw`
                SELECT * FROM transit 
                WHERE flightNumFrom = ${flightNumFrom} AND flightNumTo = ${flightNumTo} AND airlineCodeFrom = ${airlineCodeFrom} AND airlineCodeTo = ${airlineCodeTo}
            `
            if (transitExists.length === 0) {
                return error(404, {
                    status: false,
                    message: 'Transit not found',
                })
            }
            await prisma.$executeRaw`
                DELETE FROM transit 
                WHERE flightNumFrom = ${flightNumFrom} AND flightNumTo = ${flightNumTo} AND airlineCodeFrom = ${airlineCodeFrom} AND airlineCodeTo = ${airlineCodeTo}
            `
            return {
                status: true,
                message: 'Transit deleted successfully',
            }
        }catch(err){
            console.error(err)
            return error(500, {
                status: false,
                message: 'Internal server error',
                error: err,
            })
        }
    })
    .post("/addAirline", async({body}:{body:SubmitAirline})=>{
        try{
            const { airlineCode, airlineName } = body
            if (!airlineCode || !airlineName) {
                return error(400, {
                    status: false,
                    message: 'Missing required fields',
                })
            }
            // Check if airline already exists
            const airlineExists:airline[] = await prisma.$queryRaw`
                SELECT * FROM airline 
                WHERE airlineCode = ${airlineCode}
            `
            if (airlineExists.length > 0) {
                return error(400, {
                    status: false,
                    message: 'Airline already exists',
                })
            }

            await prisma.$executeRaw`
                INSERT INTO airline (airlineCode, airlineName) 
                VALUES (${airlineCode}, ${airlineName})
            `
            return {
                status: true,
                message: 'Airline added successfully',
            }
        }catch(err){
            console.error(err)
            return error(500, {
                status: false,
                message: 'Internal server error',
                error: err,
            })
        }
    })
    .put("/editAirline", async({body}:{body:SubmitAirline})=>{
        try{
            const { airlineCode, airlineName } = body
            if (!airlineCode || !airlineName) {
                return error(400, {
                    status: false,
                    message: 'Missing required fields',
                })
            }

            // Check if airline exists
            const airlineExists:airline[] = await prisma.$queryRaw`
                SELECT * FROM airline 
                WHERE airlineCode = ${airlineCode}
            `
            if (airlineExists.length === 0 || airlineExists.length > 1) {
                return error(404, {
                    status: false,
                    message: 'Airline not found',
                })
            }

            await prisma.$executeRaw`
                UPDATE airline 
                SET airlineName = ${airlineName} 
                WHERE airlineCode = ${airlineCode}
            `
            return {
                status: true,
                message: 'Airline updated successfully',
            }
        }catch(err){
            console.error(err)
            return error(500, {
                status: false,
                message: 'Internal server error',
                error: err,
            })
        }
    })
    .post("/addAirport", async({body}:{body:SubmitAirport})=>{
        const{airportCode, name, country, city, timezone, latitude, longitude, altitude} = body
        if (!airportCode || !name || !country || !city || !timezone || !latitude || !longitude) {
            return error(400, {
                status: false,
                message: 'Missing required fields',
            })
        }else{
            try{
                //check if airport code already exists
                const airportExists:{airportCode: string}[] = await prisma.$queryRaw`
                    SELECT airportCode FROM airport 
                    WHERE airportCode = ${airportCode}
                `
                if (airportExists.length > 0) {
                    return error(400, {
                        status: false,
                        message: 'Airport already exists',
                    })
                }
                await prisma.$executeRaw`
                    INSERT INTO airport (airportCode, name, country, city, timezone, latitude, longitude, altitude) 
                    VALUES (${airportCode}, ${name}, ${country}, ${city}, ${timezone}, ${latitude}, ${longitude}, ${altitude})
                `
                return {
                    status: true,
                    message: 'Airport added successfully',
                }
            }catch(err){
                console.error(err)
                return error(500, {
                    status: false,
                    message: 'Internal server error',
                    error: err,
                })
            }
        }    
    })
    .put("/editAirport", async({body}:{body:SubmitAirport})=>{
        const{airportCode, name, country, city, timezone, latitude, longitude, altitude} = body
        if (!airportCode || !name || !country || !city || !timezone || !latitude || !longitude) {
            return error(400, {
                status: false,
                message: 'Missing required fields',
            })
        }else{
            try{
                //check if airport code already exists
                const airportExists:{airportCode: string}[] = await prisma.$queryRaw`
                    SELECT airportCode FROM airport 
                    WHERE airportCode = ${airportCode}
                `
                if (airportExists.length === 0) {
                    return error(400, {
                        status: false,
                        message: 'Airport does not exist',
                    })
                }
                await prisma.$executeRaw`
                    UPDATE airport 
                    SET name = ${name}, country = ${country}, city = ${city}, timezone = ${timezone}, latitude = ${latitude}, longitude = ${longitude}, altitude = ${altitude}
                    WHERE airportCode = ${airportCode}
                `
                return {
                    status: true,
                    message: 'Airport updated successfully',
                }
            }catch(err){
                console.error(err)
                return error(500, {
                    status: false,
                    message: 'Internal server error',
                    error: err,
                })
            }
        }
    })
    .get("/schedule/:size/:kind/:page", async ({params,query}:{params:{ size:number, page:number, kind:"all" | "upcoming" | "inflight" | "completed" }, query:{query:string}})=>{
        const timeStart = Date.now()
        const { size, page, kind} = params
        if(isNaN(parseInt(String(size))) || isNaN(parseInt(String(page)))){
            return error(400, {
                status: false,
                message: 'Invalid size or page',
            })
        }
        const { query:searchString } = query
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
            
            if(!searchString || searchString === "" || searchString === undefined || searchString === null){
                // Initialize the base query parts
                let queryString = `
                    SELECT 
                        fo.flightId,
                        fo.flightNum,
                        fo.airlineCode,
                        a.airlineName,
                        fo.departureTime,
                        da.timezone AS departTimezone,
                        fo.arrivalTime,
                        aa.timezone AS arriveTimezone,
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
                }else if (kind === "all") {
                    queryString += ` WHERE fo.departureTime > 
    CASE
        WHEN UTC_TIME() < '12:00:00' THEN CAST(CONCAT(UTC_DATE(), ' 00:00:00') AS DATETIME)
        ELSE CAST(CONCAT(UTC_DATE(), ' 12:00:00') AS DATETIME)
    END`;
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
                } else if (kind === "all") {
                    countQueryString += ` WHERE fo.departureTime > 
    CASE
        WHEN UTC_TIME() < '12:00:00' THEN CAST(CONCAT(UTC_DATE(), ' 00:00:00') AS DATETIME)
        ELSE CAST(CONCAT(UTC_DATE(), ' 12:00:00') AS DATETIME)
    END`;
                }
                
                totalCount = await prisma.$queryRawUnsafe(countQueryString);
            } else {
                console.log("---Searching with query---")
                console.log("searchString", searchString)
                // Build search query with wildcard
                const wildcardValue = `%${sanitizeStringForSql(searchString)}%`; // Assuming 'wildcard' was derived from 'query'
                
                let queryString = `
                    SELECT 
                        fo.flightId,
                        fo.flightNum,
                        fo.airlineCode,
                        a.airlineName,
                        fo.departureTime,
                        da.timezone AS departTimezone,
                        fo.arrivalTime,
                        aa.timezone AS arriveTimezone,
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
                } else if (kind === "all") {
                    queryString += ` AND fo.departureTime > 
    CASE
        WHEN UTC_TIME() < '12:00:00' THEN CAST(CONCAT(UTC_DATE(), ' 00:00:00') AS DATETIME)
        ELSE CAST(CONCAT(UTC_DATE(), ' 12:00:00') AS DATETIME)
    END`;
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
                } else if (kind === "all") {
                    countQueryString += ` AND fo.departureTime > 
    CASE
        WHEN UTC_TIME() < '12:00:00' THEN CAST(CONCAT(UTC_DATE(), ' 00:00:00') AS DATETIME)
        ELSE CAST(CONCAT(UTC_DATE(), ' 12:00:00') AS DATETIME)
    END`;
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
    .post("/searchFlight", async ({ body }:{
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
            if (transitCount === 0 || transitCount == 1) {
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
                    WHERE
                        f.departAirportId = ${depAirport}
                        AND f.arriveAirportId = ${arrAirport}
                        AND DATE(CONVERT_TZ(fo.departureTime, 'UTC', da.timezone)) = ${depDate}
                        AND fo.departureTime > UTC_TIMESTAMP() + INTERVAL 90 MINUTE
                        AND (
                            SELECT COUNT(s.seatId) - COUNT(CASE WHEN t.ticketId IS NOT NULL AND (b.status = 'PAID') THEN 1 ELSE NULL END)
                            FROM seat s
                            LEFT JOIN ticket t ON t.seatId = s.seatId AND t.flightId = fo.flightId
                            LEFT JOIN booking b ON t.bookingId = b.bookingId
                            WHERE s.seatMapId = sm.seatMapId AND s.class = ${flightClass}
                        ) > ${passengerCount};
                `
                if(transitCount == 0){
                    return {
                        status: true,
                        message: 'Flight list retrieved successfully',
                        data: convertToUniversalFormat(flightClass, sanitizeBigInt(result)),
                    };
                }
            }
            if (transitCount == 1) {
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
                                JOIN airport dep ON f.departAirportId = dep.airportCode
                                WHERE f.departAirportId = ${depAirport} 
                                AND DATE(CONVERT_TZ(fo.departureTime, 'UTC', dep.timezone)) = ${depDate}
                                AND fo.departureTime > UTC_TIMESTAMP() + INTERVAL 90 MINUTE
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
                        JOIN (SELECT fo.* 
                                FROM flightOperate fo
                                JOIN flight f ON fo.flightNum = f.flightNum AND fo.airlineCode = f.airlineCode
                                JOIN airport dep ON f.departAirportId = dep.airportCode
                                WHERE f.arriveAirportId = ${arrAirport}
                                AND DATE(CONVERT_TZ(fo.departureTime, 'UTC', dep.timezone)) IN (${depDate}, DATE_ADD(${depDate}, INTERVAL 1 DAY))
                                AND fo.departureTime > UTC_TIMESTAMP() + INTERVAL 90 MINUTE
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
                            AND (b.status = 'PAID')
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
                            AND (b.status = 'PAID')
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
                    data: [
                        ...convertToUniversalFormat(flightClass, sanitizeBigInt(result), []),
                        ...convertToUniversalFormat(flightClass, [], sanitizeBigInt(result1)),
                    ],
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
    })
    .post("/flightlist/:airline/:size/:page", async ({params, body}:{
        body:{search: string},
        params:{airline:string, size:number, page:number, search:string}
    })=>{
        const { airline, size, page, } = params
        const { search } = body
        if(!airline || !size || !page){
            return error(400, {
                status: false,
                message: 'Missing required fields',
            })
        }
        const offset = (page - 1) * size
        const limit = size
        let result: adminFlightListType[] = []
        let totalCount: { count: number }[] = []
        const wildcardValue = `%${search}%` // Assuming 'wildcard' was derived from 'query'
        try {
            if(search === '' || search === undefined || !search){
                result = await prisma.$queryRaw`
                    SELECT 
                        f.flightNum,
                        f.airlineCode,
                        a.airlineName,
                        f.departAirportId,
                        da.name AS departAirportName,
                        f.arriveAirportId,
                        aa.name AS arriveAirportName,
                        f.departureTime AS utcDepartureTime,
                        f.arrivalTime AS utcArrivalTime,
                        COUNT(DISTINCT fo.flightId) AS flightCount
                    FROM flight f
                    JOIN airline a ON a.airlineCode = f.airlineCode
                    JOIN airport da ON f.departAirportId = da.airportCode
                    JOIN airport aa ON f.arriveAirportId = aa.airportCode
                    LEFT JOIN flightOperate fo ON fo.flightNum = f.flightNum AND fo.airlineCode = f.airlineCode
                    WHERE a.airlineCode = ${airline}
                    GROUP BY 
                        f.flightNum, 
                        f.airlineCode, 
                        a.airlineName, 
                        f.departAirportId, 
                        da.name, 
                        f.arriveAirportId, 
                        aa.name, f.departureTime, f.arrivalTime
                    LIMIT ${limit} OFFSET ${offset}
                `
                totalCount = await prisma.$queryRaw`
                    SELECT COUNT(*) AS count 
                    FROM flight f
                    JOIN airline a ON a.airlineCode = f.airlineCode
                    WHERE a.airlineCode = ${airline}
                `

            }else{
                result = await prisma.$queryRaw`
                    SELECT 
                        f.flightNum,
                        f.airlineCode,
                        a.airlineName,
                        f.departAirportId,
                        da.name AS departAirportName,
                        f.arriveAirportId,
                        aa.name AS arriveAirportName,
                        f.departureTime AS utcDepartureTime,
                        f.arrivalTime AS utcArrivalTime,
                        COUNT(DISTINCT fo.flightId) AS flightCount
                    FROM flight f
                    JOIN airline a ON a.airlineCode = f.airlineCode
                    JOIN airport da ON f.departAirportId = da.airportCode
                    JOIN airport aa ON f.arriveAirportId = aa.airportCode
                    LEFT JOIN flightOperate fo ON fo.flightNum = f.flightNum AND fo.airlineCode = f.airlineCode
                    WHERE a.airlineCode = ${airline}
                    AND (
                        f.flightNum LIKE ${wildcardValue}
                        OR da.name LIKE ${wildcardValue}
                        OR f.departAirportId LIKE ${wildcardValue}
                        OR aa.name LIKE ${wildcardValue}
                        OR f.arrivalTime LIKE ${wildcardValue}
                    )
                    GROUP BY 
                        f.flightNum, 
                        f.airlineCode, 
                        a.airlineName, 
                        f.departAirportId, 
                        da.name, 
                        f.arriveAirportId, 
                        aa.name, f.departureTime, f.arrivalTime
                    LIMIT ${limit} OFFSET ${offset}
                `
                totalCount = await prisma.$queryRaw`
                    SELECT COUNT(*) AS count 
                    FROM flight f
                    JOIN airline a ON a.airlineCode = f.airlineCode
                    JOIN airport da ON f.departAirportId = da.airportCode
                    JOIN airport aa ON f.arriveAirportId = aa.airportCode
                    WHERE a.airlineCode = ${airline} AND (
                        f.flightNum LIKE ${wildcardValue}
                        OR da.name LIKE ${wildcardValue}
                        OR f.departAirportId LIKE ${wildcardValue}
                        OR aa.name LIKE ${wildcardValue}
                        OR f.arrivalTime LIKE ${wildcardValue}
                    )
                `
            }

            if (result.length === 0) {
                return {
                    status: false,
                    message: 'No flights found',
                    totalCount: 0,
                    page: page,
                    size: size,
                    data: [],
                }
            }
            return {
                status: true,
                message: 'Flight list retrieved successfully',
                totalCount: sanitizeBigInt(totalCount)[0].count,
                page: page,
                size: size,
                data: sanitizeBigInt(result),
            }
        }catch(err){
            console.error(err)
            return error(500, {
                status: false,
                message: 'Internal server error',
                error: err instanceof Error ? err.message : String(err),
            })
        }

    }, {
        detail:{
            requestBody: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                search: { type: 'string' },
                            },
                        },
                    },
                },
            },
            
        }
    })
    .post("/transit/:airline/:size/:page", async ({params, body}:{
        params:{size:number, page:number, airline:string},
        body:{search: string}
    })=>{
        const { size, page, airline } = params
        const { search } = body
        if(!size || !page){
            return error(400, {
                status: false,
                message: 'Missing required fields',
            })
        }
        const offset = (page - 1) * size
        const limit = size
        let result: adminTransitListType[] = []
        let totalCount: { count: number }[] = []
        const wildcardValue = `%${search}%` // Assuming 'wildcard' was derived from 'query'
        try {
            if(search === '' || search === undefined || !search){
                result = await prisma.$queryRaw`
                    SELECT 
                        t.flightNumFrom,
                        t.airlineCodeFrom,
                        a1.airlineName AS airlineNameFrom,
                        t.flightNumTo,
                        t.airlineCodeTo,
                        a2.airlineName AS airlineNameTo,
                        f1.departAirportId AS departureAirportCode,
                        f1.arriveAirportId AS transitAirportCode,
                        f2.arriveAirportId AS arrivalAirportCode
                    FROM transit t
                    JOIN airline a1 ON a1.airlineCode = t.airlineCodeFrom
                    JOIN airline a2 ON a2.airlineCode = t.airlineCodeTo
                    JOIN flight f1 ON f1.flightNum = t.flightNumFrom AND f1.airlineCode = t.airlineCodeFrom
                    JOIN flight f2 ON f2.flightNum = t.flightNumTo AND f2.airlineCode = t.airlineCodeTo
                    WHERE t.airlineCodeFrom = ${airline} OR t.airlineCodeTo = ${airline}
                    LIMIT ${limit} OFFSET ${offset};
                `
                totalCount = await prisma.$queryRaw`
                    SELECT COUNT(*) AS count 
                    FROM transit t
                    WHERE t.airlineCodeFrom = ${airline} OR t.airlineCodeTo = ${airline}
                `
            }else{
                result = await prisma.$queryRaw`
                    SELECT 
                        t.flightNumFrom,
                        t.airlineCodeFrom,
                        a1.airlineName AS airlineNameFrom,
                        t.flightNumTo,
                        t.airlineCodeTo,
                        a2.airlineName AS airlineNameTo,
                        f1.departAirportId AS departureAirportCode,
                        f1.arriveAirportId AS transitAirportCode,
                        f2.arriveAirportId AS arrivalAirportCode
                    FROM transit t
                    JOIN airline a1 ON a1.airlineCode = t.airlineCodeFrom
                    JOIN airline a2 ON a2.airlineCode = t.airlineCodeTo
                    JOIN flight f1 ON f1.flightNum = t.flightNumFrom AND f1.airlineCode = t.airlineCodeFrom
                    JOIN flight f2 ON f2.flightNum = t.flightNumTo AND f2.airlineCode = t.airlineCodeTo
                    WHERE (t.flightNumFrom LIKE ${wildcardValue} OR t.flightNumTo LIKE ${wildcardValue}
                    OR f1.departAirportId LIKE ${wildcardValue} OR f2.arriveAirportId LIKE ${wildcardValue}
                    OR f1.arriveAirportId LIKE ${wildcardValue} OR f2.departAirportId LIKE ${wildcardValue})
                    AND (t.airlineCodeFrom = ${airline} OR t.airlineCodeTo = ${airline})
                    LIMIT ${limit} OFFSET ${offset};
                `
                totalCount = await prisma.$queryRaw`
                    SELECT COUNT(*) AS count 
                    FROM transit t
                    JOIN airline a1 ON a1.airlineCode = t.airlineCodeFrom
                    JOIN airline a2 ON a2.airlineCode = t.airlineCodeTo
                    JOIN flight f1 ON f1.flightNum = t.flightNumFrom AND f1.airlineCode = t.airlineCodeFrom
                    JOIN flight f2 ON f2.flightNum = t.flightNumTo AND f2.airlineCode = t.airlineCodeTo
                    WHERE (t.flightNumFrom LIKE ${wildcardValue} OR t.flightNumTo LIKE ${wildcardValue}
                    OR f1.departAirportId LIKE ${wildcardValue} OR f2.arriveAirportId LIKE ${wildcardValue}
                    OR f1.arriveAirportId LIKE ${wildcardValue} OR f2.departAirportId LIKE ${wildcardValue})
                    AND (t.airlineCodeFrom = ${airline} OR t.airlineCodeTo = ${airline})
                `
            }
            if (result.length === 0) {
                return {
                    status: false,
                    message: 'No flights found',
                    totalCount: 0,
                    page: page,
                    size: size,
                    data: [],
                }
            }
            return {
                status: true,
                message: 'Transit list retrieved successfully',
                totalCount: sanitizeBigInt(totalCount)[0].count,
                page: page,
                size: size,
                data: sanitizeBigInt(result),
            }
        }catch(err){
            console.error(err)
            return error(500, {
                status: false,
                message: 'Internal server error',
                error: err instanceof Error ? err.message : String(err),
            })
        }
    },{
        detail:{
            requestBody: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                search: { type: 'string' },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: 'Transit list retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'boolean' },
                                    message: { type: 'string' },
                                    totalCount: { type: 'number' },
                                    page: { type: 'number' },
                                    size: { type: 'number' },
                                    data: { type: 'array', items: { type: 'object' } },
                                },
                            },
                        },
                    },
                },
            }
        }
    })
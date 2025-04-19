import { v4 as uuidv4 } from 'uuid'
import Elysia, { error, t } from "elysia";
import { PrismaClient} from "../prisma-client";
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
import Elysia, { error } from "elysia";
import { flight as Flight, airport as Airport, airline as Airline, aircraft as Aircraft, seatmap_info as SeatmapInfo } from "../../prisma-client";
// import countries from "i18n-iso-countries";
import modelAircraft from "../../data/model_name.json"
import { sanitizeBigInt } from "@/server/lib";
import { PrismaClient } from "../../prisma-client";
import { Schedule } from "@/types/type";
import { countryNameToCode } from "@/lib/country";

const prisma = new PrismaClient()
const countryNameToCodeMap: Record<string, string> = countryNameToCode;

// extends type Aircraft
interface AircraftExtends extends Aircraft {
    totalFlight: number
}

export const autocompleteModule = new Elysia({
    prefix: '/autocomplete',
    })
    .post("/airport/:search", async({body, params:{search}}:{body:{lat?:number,lon?:number},params:{search:string}})=>{
        //html decode the search string
        try{
            const searchstring = decodeURIComponent(search)
            let airportList: Airport[];
            if(search == "nearby_airport"){
                const lat = body?.lat;
                const lon = body?.lon;
                if(!lat || !lon){
                    return error(400, "geolocation_required")
                }
                airportList = await prisma.$queryRaw`SELECT
                    \`airportCode\`,
                    \`name\`,
                    latitude,
                    longitude,
                    (
                        6371 * ACOS(
                            COS(RADIANS(${lat})) * COS(RADIANS(latitude)) *
                            COS(RADIANS(longitude) - RADIANS(${lon})) +
                            SIN(RADIANS(${lat})) * SIN(RADIANS(latitude))
                        )
                    ) AS distance_km
                FROM airport
                HAVING distance_km < 100
                ORDER BY distance_km ASC
                LIMIT 10;`
            }else if(search == "popular_airport"){
                airportList = await prisma.$queryRaw`
                    SELECT airportCode, \`name\`, country, city FROM airport
                    WHERE airportCode IN (
                        'BKK','CNX','HKT','HKG','SIN','ICN','NRT','HND','LHR','FRA','CDG','DXB','JFK','LAX','PEK'
                    )
                    LIMIT 20;
                `
            }else if(!searchstring.includes(" ")){
                // const wildcard = `'%${searchstring}%'`
                const wildcard = `%${searchstring}%` //Why don't we put "'" in the wildcard?
                                                    //Because of prisma auto handling quoting symbols
                                                    //If you use others like phpmyadmin, you need to put "'"
                                                    //It will be like this: '%${searchstring}%'
                                                    //instead of %${searchstring}% in prisma
                airportList = await prisma.$queryRaw`
                    SELECT airportCode, \`name\`, country, city FROM airport
                    WHERE airportCode LIKE ${wildcard}
                    OR \`name\` LIKE ${wildcard}
                    OR country LIKE ${wildcard}
                    OR city LIKE ${wildcard}
                    LIMIT 20;
                `
            }else{
                const searchstringArray = searchstring.trim().split(/\s+/);
                const wildcardArray = searchstringArray.map(word => `%${word}%`);
                
                const andConditions: string[] = [];
                const values: string[] = [];
                
                wildcardArray.forEach((wildcard) => {
                // Each word needs to match one of the 4 columns
                andConditions.push(`(airportCode LIKE ? OR name LIKE ? OR country LIKE ? OR city LIKE ?)`);
                values.push(wildcard, wildcard, wildcard, wildcard);
                });
                
                const whereClause = andConditions.join(' AND ');
                const query = `SELECT airportCode, \`name\`, country, city FROM airport WHERE ${whereClause} LIMIT 20`;
                
                airportList = await prisma.$queryRawUnsafe(query, ...values);
            }
            const airportReturn = airportList.map((airport)=>{
                return {
                    code: airport.airportCode,
                    name: airport.name,
                    short_country: countryNameToCodeMap[airport.country] || airport.country,
                    country: airport.country,
                    city: airport.city
                }
            })
            return airportReturn
        }catch(e){
            console.error(e)
            return error(500, {
                status: false,
                message: "Internal server error",
                error: e
            })
        }
    },{
        detail:{
            tags: ['Autocomplete'],
            description: "This endpoint is used to get the autocomplete data for the flight search.",
            responses:{
                200:{
                    description: "Successfully fetched autocomplete data",
                    content:{
                        "application/json": {
                            schema: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        code: {type: "string"},
                                        name: {type: "string"},
                                        short_country: {type: "string"},
                                        country: {type: "string"},
                                        city: {type: "string"}
                                    }
                                }
                            }
                        }
                    }
                },
                400:{
                    description: "Bad request",
                }
            }
        }
    })
    .get("/airline/:search", async({params:{search}}:{params:{search:string}})=>{
        //html decode the search string
        const searchstring = decodeURIComponent(search)
        let airlineList:Airline[] = []
        if(!searchstring.includes(" ") && !searchstring.startsWith("ap:")){
            const wildcard = `%${searchstring}%`
            airlineList = await prisma.$queryRaw`
                SELECT airlineCode, airlineName FROM airline
                WHERE airlineCode LIKE ${wildcard}
                OR airlineName LIKE ${wildcard}
                LIMIT 30;
            `
        }else if(searchstring.startsWith("ap:")){
            console.log("Search with airport code")
            const airportCode = searchstring.split(":")[1].trim().toUpperCase()
            if(airportCode.length != 3) return error(400, [])
            airlineList = await prisma.$queryRaw`
                SELECT airlineCode, airlineName
                FROM airline
                WHERE airlineCode IN (
                    SELECT DISTINCT airlineCode
                    FROM flight
                    WHERE departAirportId = ${airportCode} OR arriveAirportId = ${airportCode}
                )
                LIMIT 40;
            `
        }else{
            const searchstringArray = searchstring.trim().split(/\s+/);
            const wildcardArray = searchstringArray.map(word => `%${word}%`);
            
            const andConditions: string[] = [];
            const values: string[] = [];
            
            wildcardArray.forEach((wildcard) => {
              // Each word needs to match one of the 4 columns
              andConditions.push(`(airlineCode LIKE ? OR airlineName LIKE ? )`);
              values.push(wildcard, wildcard);
            });
            
            const whereClause = andConditions.join(' AND ');
            const query = `SELECT airlineCode, airlineName FROM airline WHERE ${whereClause} LIMIT 20`;
            
            airlineList = await prisma.$queryRawUnsafe(query, ...values);
        }
        const airlineReturn = airlineList.map((airline)=>{ 
            return {
                code: airline.airlineCode,
                name: airline.airlineName,
            }
        })
        return airlineReturn
    },{
        detail:{
            tags: ['Autocomplete'],
            description: "This endpoint is used to get the autocomplete data for the flight search.",
            responses:{
                200:{
                    description: "Successfully fetched autocomplete data",
                    content:{
                        "application/json": {
                            schema: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        code: {type: "string"},
                                        name: {type: "string"}
                                    }
                                }
                            }
                        }
                    }
                },
                400:{
                    description: "Bad request",
                }
            }
        }
    })
    .get("/flight/:airline/:search", async({params:{airline, search}}:{params:{airline:string, search:string}})=>{
        const airlineCode = decodeURIComponent(airline)
        if (!airlineCode || airlineCode.length != 2) return error(400, "invalid_airline_code")
        
        const searchstring = decodeURIComponent(search)
        const emptySearch = searchstring === ""
        
        let flightList: Flight[]
        
        if (emptySearch) {
          flightList = await prisma.$queryRaw`
            SELECT flightNum, airlineCode, departAirportId, arriveAirportId, arrivalTime, departureTime 
            FROM flight
            WHERE airlineCode = ${airlineCode}
            LIMIT 30;
          `
        } else if (searchstring.includes(",")) {
            const [part1, part2] = searchstring.split(",").map(s => s.trim().toUpperCase())
            if (!part1 || !part2) return error(400, [])
            if(part1.length != 3 || part2.length != 3) return error(400, [])
            
            flightList = await prisma.$queryRaw`
                SELECT flightNum, airlineCode, departAirportId, arriveAirportId, arrivalTime, departureTime 
                FROM flight
                WHERE airlineCode = ${airlineCode}
                AND (
                    (departAirportId = ${part1} AND arriveAirportId = ${part2})
                )
                LIMIT 30;
            `
        } else {
          const wildcard = `%${searchstring}%`
          flightList = await prisma.$queryRaw`
            SELECT flightNum, airlineCode, departAirportId, arriveAirportId, arrivalTime, departureTime 
            FROM flight
            WHERE airlineCode = ${airlineCode}
              AND (
                flightNum LIKE ${wildcard} OR 
                departAirportId LIKE ${wildcard} OR 
                arriveAirportId LIKE ${wildcard}
              )
            LIMIT 30;
          `
        }
        
        return flightList.map((flight) => ({
          flight_number: flight.flightNum,
          airlineCode: flight.airlineCode,
          depart_airport: flight.departAirportId,
          arrive_airport: flight.arriveAirportId,
          arrival_time: flight.arrivalTime,
          departure_time: flight.departureTime
        }))
    },{
        detail:{
            tags: ['Autocomplete'],
            description: "This endpoint is used to get the autocomplete data for the flight search.",
            responses:{
                200:{
                    description: "Successfully fetched autocomplete data",
                    content:{
                        "application/json": {
                            schema: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        flight_number: {type: "string"},
                                        airlineCode: {type: "string"},
                                        depart_airport: {type: "string"},
                                        arrive_airport: {type: "string"},
                                        arrival_time: {type: "string"},
                                        departure_time: {type: "string"}
                                    }
                                }
                            }
                        }
                    }
                },
                400:{
                    description: "Bad request",
                }
            }
        }
    })
    .get("/schedule/:airline/:page", async({params:{airline, page}}:{params:{airline:string,page:number}})=>{
        //html decode the search string
        try{

            const airlineCode = decodeURIComponent(airline)
            //check if airlineCode is valid
            if(!airlineCode || airlineCode.length != 2) return error(400, "invalid_airline_code")
                if(!page || page < 1 || typeof page != "number") return error(400, "invalid_page_number")
                    const pageSize = 25
                const offset = (page - 1) * pageSize

                const flightList: Schedule[] = await prisma.$queryRaw`
                SELECT 
                    fo.flightId,
                    fo.flightNum,
                    fo.airlineCode,
                    al.airlineName,
                    fo.departureTime,
                    fo.arrivalTime,
                    fo.departureGate,
                    fo.aircraftId,
                    ac.model AS aircraftModel,
                    dap.name AS departureAirport,
                    dap.code AS departureAirportCode,
                    aap.name AS arrivalAirport
                    aap.code AS arrivalAirportCode
                FROM flightOperate fo
                JOIN (SELECT model, aircraftId FROM aircraft WHERE ownerAirlineCode = ${airlineCode}) ac 
                    ON fo.aircraftId = ac.aircraftId
                JOIN (SELECT airlineName, airlineCode FROM airline WHERE airlineCode = ${airlineCode}) al 
                    ON fo.airlineCode = al.airlineCode
                JOIN flight f 
                    ON fo.flightNum = f.flightNum AND fo.airlineCode = f.airlineCode
                JOIN airport dap 
                    ON f.departAirportId = dap.airportCode
                JOIN airport aap 
                    ON f.arriveAirportId = aap.airportCode
                WHERE fo.airlineCode = ${airlineCode}
                LIMIT ${pageSize} OFFSET ${offset};
            `

            return flightList
        }catch(e){
            console.error(e)
            return error(500, {
                status: false,
                message: "Internal server error",
                error: e
            })
        }
    },{
        detail:{
            tags: ['Autocomplete'],
            description: "This endpoint is used to get the autocomplete data for the flight search.",
            responses:{
                200:{
                    description: "Successfully fetched autocomplete data",
                    content:{
                        "application/json": {
                            schema: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        flightId: {type: "string"},
                                        flightNum: {type: "string"},
                                        airlineCode: {type: "string"},
                                        airlineName: {type: "string"},
                                        departureTime: {type: "string"},
                                        arrivalTime: {type: "string"},
                                        departureGate: {type: "string"},
                                        aircraftId: {type: "string"},
                                        aircraftModel:{type:"string"}
                                    }
                                }
                            }
                        }
                    }
                },
                400:{
                    description: "Bad request",
                }
            }
        }
    })
    .get("/model/:airline", async({params:{airline}}:{params:{airline:string}})=>{
        //html decode the search string
        const airlineCode = decodeURIComponent(airline)
        //check if airlineCode is valid
        if(!airlineCode || airlineCode.length != 2) return error(400, "invalid_airline_code")

        const aircraftList:Aircraft[] = await prisma.$queryRaw`
            SELECT DISTINCT \`ownerAirlineCode\`, \`model\` FROM \`aircraft\` WHERE \`ownerAirlineCode\` = ${airlineCode};
        `
        return aircraftList.map((aircraft)=>{ 
            return {
                model: aircraft.model,
                model_name: modelAircraft[aircraft.model as keyof typeof modelAircraft] || aircraft.model,
                airlineCode: aircraft.ownerAirlineCode,
            }
        })
    },{
        detail:{
            tags: ['Autocomplete'],
            description: "This endpoint is used to get the autocomplete data for the flight search.",
            responses:{
                200:{
                    description: "Successfully fetched autocomplete data",
                    content:{
                        "application/json": {
                            schema: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        model: {type: "string"},
                                        model_name: {type: "string"},
                                        airlineCode: {type: "string"}
                                    }
                                }
                            }
                        }
                    }
                },
                400:{
                    description: "Bad request",
                }
            }
        }
    })
    .get("/registration/:airline/:model", async({params:{airline, model}}:{params:{airline:string, model:string}})=>{
        //html decode the search string
        try{
            const airlineCode = decodeURIComponent(airline)
            const modelName = decodeURIComponent(model)
            //check if airlineCode is valid
            if(!airlineCode || airlineCode.length != 2) return error(400, "invalid_airline_code")
            //check if modelName is valid
            if(!modelName) return error(400, "invalid_model_name")

            const aircraftList:Aircraft[] = await prisma.$queryRaw`
                SELECT \`aircraftId\`, \`model\`, \`ownerAirlineCode\` FROM \`aircraft\` WHERE \`ownerAirlineCode\` = ${airlineCode} AND \`model\` = ${modelName};
            `
            return aircraftList.map((aircraft)=>{ 
                return {
                    registration: aircraft.aircraftId,
                    model: aircraft.model,
                    airlineCode: aircraft.ownerAirlineCode,
                }
            })
        }catch(e){
            console.error(e)
            return error(500, {
                status: false,
                message: "Internal server error",
                error: e
            })
        }
    },{
        detail:{
            tags: ['Autocomplete'],
            description: "This endpoint is used to get the autocomplete data for the flight search.",
            responses:{
                200:{
                    description: "Successfully fetched autocomplete data",
                    content:{
                        "application/json": {
                            schema: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        registration: {type: "string"},
                                        model: {type: "string"},
                                        airlineCode: {type: "string"}
                                    }
                                }
                            }
                        }
                    }
                },
                400:{
                    description: "Bad request",
                }
            }
        }
    })
    .get("/aircraft/:airline/:size/:page", async({params}:{params:{airline:string, size:number, page:number}})=>{
        //html decode the search string
        try{
            const {airline, size, page} = params
            //check if airlineCode is valid
            const airlineCode = decodeURIComponent(airline)
            if(!airlineCode || airlineCode.length != 2) return error(400, "invalid_airline_code")
            if(!page || page < 1) return error(400, "invalid_page_number")
            if(!size || size < 1) return error(400, "invalid_page_size")
            
            const offset = (page - 1) * size
            const limit = size

            const aircraftList:AircraftExtends[] = await prisma.$queryRaw`
                SELECT \`aircraftId\`, \`model\`, \`ownerAirlineCode\`,
                (SELECT COUNT(*) FROM flightOperate fo WHERE fo.aircraftId = ac.aircraftId) AS totalFlight 
                FROM \`aircraft\` ac 
                WHERE \`ownerAirlineCode\` = ${airlineCode}
                LIMIT ${limit} OFFSET ${offset};
            `
            const totalCount: number = await prisma.$queryRaw`
                SELECT COUNT(*) as count FROM \`aircraft\` WHERE \`ownerAirlineCode\` = ${airlineCode};
            `
            return {
                status: true,
                data: sanitizeBigInt(aircraftList).map((aircraft:AircraftExtends)=>{
                    return {
                        registration: aircraft.aircraftId,
                        model: aircraft.model,
                        airlineCode: aircraft.ownerAirlineCode,
                        totalFlight: aircraft.totalFlight,
                    }
                }),
                totalCount: sanitizeBigInt(totalCount)[0].count,
                page: page,
                pageSize: size,
            }
        }catch(e){
            console.error(e)
            return error(500, {
                status: false,
                message: "Internal server error",
                error: e
            })
        }
    },{
        detail:{
            tags: ['Autocomplete'],
            description: "This endpoint is used to get the autocomplete data for the flight search.",
            responses:{
                200:{
                    description: "Successfully fetched autocomplete data",
                    content:{
                        "application/json": {
                            schema: {
                                type: "object",
                                properties:{
                                    data: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                registration: {type: "string"},
                                                model: {type: "string"},
                                                airlineCode: {type: "string"}
                                            }
                                        }
                                    },
                                    totalCount:{
                                        type:"number"
                                    },
                                    page:{
                                        type:"number"
                                    },
                                    pageSize:{
                                        type:"number"
                                    }
                                }
                            }
                        }
                    }
                },
                400:{
                    description: "Bad request",
                }
            }
        }
    })
    .get("/seatmap/:airline/:model", async({params:{airline, model}}:{params:{airline:string, model:string}})=>{
        //html decode the search string
        try{
            const airlineCode = decodeURIComponent(airline)
            const modelName = decodeURIComponent(model)
            //check if airlineCode is valid
            if(!airlineCode || airlineCode.length != 2) return error(400, "invalid_airline_code")
            //check if modelName is valid
            if(!modelName) return error(400, "invalid_model_name")

            const aircraftList:SeatmapInfo[] = await prisma.$queryRaw`
                SELECT
                \`seatMapId\`,
                \`airlineCode\`,
                \`aircraftModel\`,
                \`version\`
                FROM \`seatmap_info\` 
                WHERE \`airlineCode\` = ${airlineCode} AND \`aircraftModel\` = ${modelName};

            `
            return aircraftList.map((aircraft)=>{ 
                return {
                    id: aircraft.seatMapId,
                    version: aircraft.version
                }
            })
        }catch(e){
            console.error(e)
            return error(500, {
                status: false,
                message: "Internal server error",
                error: e
            })
        }
    },{
        detail:{
            tags: ['Autocomplete'],
            description: "This endpoint is used to get the autocomplete data for the flight search.",
            responses:{
                200:{
                    description: "Successfully fetched autocomplete data",
                    content:{
                        "application/json": {
                            schema: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        id: {type: "string"},
                                        version: {type: "string"}
                                    }
                                }
                            }
                        }
                    }
                },
                400:{
                    description: "Bad request",
                }
            }
        }
    })
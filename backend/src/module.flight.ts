import Elysia, { error, t } from "elysia";
import * as jose from 'jose'
import { checkPasswordWithHash, hashDataWithSHA256AndSalt, JWT_SECRET } from "../lib";
import { countryToAlpha2 } from "country-to-iso";
import { flight as Flight, airport as Airport, PrismaClient, airline } from "../prisma-client";
const prisma = new PrismaClient()
const countries = require("i18n-iso-countries");
export const flightModule = new Elysia({
    prefix: '/flight',
    })
    .post("/autocomplete/airport/:search", async({body, params:{search}}:{body:{lat?:number,lon?:number},params:{search:string}})=>{
        //html decode the search string
        let searchstring = decodeURIComponent(search)
        let airportList: Airport[];
        let a:boolean = false
        const {lat, lon} = body
        if(search == "nearby_airport"){
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
            
            let andConditions: string[] = [];
            let values: string[] = [];
            
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
                short_country: countries.getName(airport.country, 'en', {select: ''}) || airport.country,
                country: airport.country,
                city: airport.city
            }
        })
        return airportReturn
    },{
        detail:{
            tags: ['Flight'],
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
    .post("/autocomplete/airline/:search", async({body, params:{search}}:{body:{lat?:number,lon?:number},params:{search:string}})=>{
        //html decode the search string
        let searchstring = decodeURIComponent(search)
        let airlineList:airline[] = []
        if(!searchstring.includes(" ")){
            const wildcard = `%${searchstring}%`
            airlineList = await prisma.$queryRaw`
                SELECT airlineCode, airlineName FROM airline
                WHERE airlineCode LIKE ${wildcard}
                OR airlineName LIKE ${wildcard}
                LIMIT 20;
            `
        }else{
            const searchstringArray = searchstring.trim().split(/\s+/);
            const wildcardArray = searchstringArray.map(word => `%${word}%`);
            
            let andConditions: string[] = [];
            let values: string[] = [];
            
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
    })
    .post("/autocomplete/flight/:airline", async({body, params:{airline}}:{body:{origin?:string,destination?:string},params:{airline:string}})=>{
        //html decode the search string
        let airlineCode = decodeURIComponent(airline)
        const {origin, destination} = body //origin and destination are airport codes
        //check if airlineCode is valid
        if(!airlineCode || airlineCode.length != 2) return error(400, "invalid_airline_code")
        if(!origin || origin.length != 3) return error(400, "invalid_airport_code")
        if(!destination || destination.length != 3) return error(400, "invalid_airport_code")

        let flightList:Flight[] = await prisma.$queryRaw`
            SELECT flightNum, airlineCode, \`name\` FROM flight
            WHERE airlineCode = ${airlineCode}
            ${origin ? `AND departAirportId = ${origin}`: ""}
            ${destination ? `AND arriveAirportId = ${destination}`: ""}
            LIMIT 20;
        `
        const flightReturn = flightList.map((flight)=>{
            return {
                flight_number: flight.flightNum,
                airline_code: flight.airlineCode,
            }
        })
        return flightReturn
    })
    .post("/addschedule", async()=>{
        return "Schedule route"
    })
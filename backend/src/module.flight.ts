import Elysia, { error, t } from "elysia";
import { Airport, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import * as jose from 'jose'
import { checkPasswordWithHash, hashDataWithSHA256AndSalt, JWT_SECRET } from "../lib";
import { countryToAlpha2 } from "country-to-iso";
const countries = require("i18n-iso-countries");
export const flightModule = new Elysia({
    prefix: '/flight',
    })
    .post("/autocomplete/:kind/:search", async({params:{kind, search}}:{params:{kind:string,search:string}})=>{
        if(kind == "airport"){
            //html decode the search string
            let searchstring = decodeURIComponent(search)
            let searchConstant = countryToAlpha2(searchstring) || search
            let airportList: Airport[];
            if(search == "popular_airport"){
                airportList = await prisma.$queryRaw`
                    SELECT airportCode, \`name\`, country, city FROM airport
                    WHERE airportCode IN (
                        'BKK','CNX','HKT','HKG','SIN','ICN','NRT','HND','LHR','FRA','CDG','DXB','JFK','LAX','PEK'
                    )
                    LIMIT 20;
                `
            }else if(searchConstant == search){
                const wildcard = `%${searchConstant}%`
                airportList = await prisma.$queryRaw`
                    SELECT airportCode, \`name\`, country, city FROM airport
                    WHERE airportCode LIKE ${wildcard}
                    OR \`name\` LIKE ${wildcard}
                    OR country LIKE ${wildcard}
                    OR city LIKE ${wildcard}
                    LIMIT 20;
                `
            }else{
                airportList = await prisma.$queryRaw`
                    SELECT airportCode, \`name\`, country, city FROM airport
                    WHERE country = ${searchConstant}
                    LIMIT 20;
                `
            }
            const airportReturn = airportList.map((airport)=>{
                return {
                    code: airport.airportCode,
                    name: airport.name,
                    short_country: countries.getName(airport.country, 'en', {select: 'official'}) || airport.country,
                    country: countries.getName(airport.country, 'en', {select: 'official'}) || airport.country,
                    city: airport.city
                }
            })
            return airportReturn
            // return {
            //     airportReturn,
            //     test: countryToAlpha2(search) || search,
            // }
        }else{
            return error(404, "Invalid kind")
        }
    },{
        detail:{
            tags: ['Flight'],
            description: "This endpoint is used to get the autocomplete data for the flight search.",
            responses:{
                200:{
                    description: "Successfully fetched autocomplete data",
                },
                400:{
                    description: "Bad request",
                }
            }
        }
    })
import Elysia, { error, t } from "elysia";
import { airport as Airport, PrismaClient } from '@prisma/client'
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
            let airportList: Airport[];
            let a:boolean = false
            if(search == "popular_airport"){
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
                    short_country: countries.getName(airport.country, 'en', {select: 'alias'}) || airport.country,
                    country: airport.country,
                    city: airport.city
                }
            })
            return airportReturn
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
                    content:{
                        "application/json": {
                            schema: t.Array(t.Object({
                                code: t.String(),
                                name: t.String(),
                                short_country: t.String(),
                                country: t.String(),
                                city: t.String()
                            }))
                        }
                    }
                },
                400:{
                    description: "Bad request",
                }
            }
        }
    })
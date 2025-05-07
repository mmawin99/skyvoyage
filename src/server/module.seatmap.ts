import Elysia from "elysia";
import { sanitizeBigInt } from "@/server/lib";
import { PrismaClient } from "../../prisma-client";
import { SeatmapAPI } from "@/types/type";

const prisma = new PrismaClient()

export const seatmapModule = new Elysia({
        prefix: '/seatmap',
    }).get('/flight/:flightId/:cabinClass', async ({params} : {params: { flightId: string; cabinClass: string }}) => {
        // Mocked seatmap data
        const {flightId, cabinClass} = params;
        try{
            const seatmap:SeatmapAPI[] = await prisma.$queryRaw`
                SELECT 
                    s.seatId, 
                    s.seatNum, 
                    s.row, 
                    s.class, 
                    s.price, 
                    s.features, 
                    s.floor, 
                    CASE 
                        WHEN t.seatId IS NULL THEN 'available' 
                        ELSE 'reserved' 
                    END AS seatStatus 
                FROM seat s 
                JOIN aircraft a ON s.seatMapId = a.seatMapId 
                JOIN flightOperate fo ON a.aircraftId = fo.aircraftId 
                LEFT JOIN ticket t ON s.seatId = t.seatId AND t.flightId = ${flightId} 
                    WHERE fo.flightId = ${flightId}
                    AND s.class = ${cabinClass}
                ORDER BY s.row, s.seatNum;`
            return {
                status: true,
                msg: "Seatmap fetched successfully",
                flightId: flightId,
                cabinClass: cabinClass,
                data: sanitizeBigInt(seatmap).map((seat: SeatmapAPI) => {
                    return {
                        seatId: seat.seatId,
                        seatNum: seat.seatNum,
                        row: seat.row,
                        column: seat.seatNum.replace(String(seat.row), ''),
                        class: seat.class,
                        price: seat.price,
                        features: typeof seat.features === 'string' ? JSON.parse(seat.features) : seat.features,
                        floor: seat.floor,
                        seatStatus: seat.seatStatus
                    }
                })
            }
        }catch(error){
            console.error("Error fetching seatmap:", error);
            return { 
                status: false,
                msg: "Failed to fetch seatmap",
                error: (error instanceof Error ? error.toString() : String(error))
            };
        }
    },{
        detail:{
            tags: ['Flight'],
            description: 'Get seatmap for a scheduled flight',
            request: {
                params: {
                    flightId: { type: 'string' },
                    cabinClass: { type: 'string' }
                },
            },
            responses:{
                200: {
                    description: 'Seatmap fetched successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'boolean' },
                                    msg: { type: 'string' },
                                    flightId: { type: 'string' },
                                    cabinClass: { type: 'string' },
                                    data: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                seatId: { type: 'string' },
                                                seatNum: { type: 'string' },
                                                row: { type: 'number' },
                                                class: { type: 'string' },
                                                price: { type: 'number' },
                                                features: { type: 'string' },
                                                floor: { type: 'number' },
                                                seatStatus: { type: 'string', enum:['available', 'reserved'] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                500:{
                    description:'Internal Server Error',
                    content:{
                        'application/json':{
                            schema:{
                                type:'object',
                                properties:{
                                    status:{type:'boolean'},
                                    msg:{type:'string'},
                                    error:{type:'string'}
                                }
                            }
                        }
                    }
                }
            }
        }
    })
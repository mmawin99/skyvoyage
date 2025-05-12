import Elysia, { error } from "elysia";
import { sanitizeBigInt } from "@/server/lib";
import { PrismaClient } from "../../prisma-client";
import { SeatmapAPI, SeatmapAPIMetadata } from "@/types/type";
import { SeatMap } from "@/types/seatmap";
import { classColorMap, classNameMap } from "@/lib/utils";

const prisma = new PrismaClient()


export const seatmapModule = new Elysia({
        prefix: '/seatmap',
    })
.get('/flight/:flightId/:cabinClass', async ({params} : {params: { flightId: string; cabinClass: string }}) => {
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
        }catch(err){
            console.error("Error fetching seatmap:", err);
            return error(500, { 
                status: false,
                msg: "Failed to fetch seatmap",
                error: (err instanceof Error ? err.toString() : String(err))
            })
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

.get("/list/:size/:page", async({params, query}:{
    params:{
        size: number,
        page: number
    },
    query:{
        query:string
    }
})=>{

    const {size, page} = params;
    const {query:queryString} = query;
    const offset = (page - 1) * size
    const limit = size
    try{
        let seatmapList:SeatmapAPIMetadata[] = [];
        let totalCount:{count: number}[];
        if(!queryString){
            seatmapList = await prisma.$queryRaw`
            SELECT 
                sm.seatMapId, 
                sm.airlineCode,
                a.airlineName,
                sm.aircraftModel,
                CONCAT('V', sm.version) AS version,
                (SELECT COUNT(*) FROM seat s WHERE s.seatMapId = sm.seatMapId) AS seatCount,
                (
                    SELECT GROUP_CONCAT(CONCAT(class_counts.class, ': ', class_counts.seat_count) SEPARATOR ', ')
                    FROM (
                        SELECT s.class, COUNT(*) AS seat_count
                        FROM seat s
                        WHERE s.seatMapId = sm.seatMapId
                        GROUP BY s.class
                    ) AS class_counts
                ) AS classDistribution
            FROM seatmap_info sm
            JOIN airline a ON sm.airlineCode = a.airlineCode
            ORDER BY sm.airlineCode, aircraftModel, \`version\`
            LIMIT ${limit} OFFSET ${offset};`
            totalCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM seatmap_info;`
        }else{
            const wildcard = `%${queryString}%`
            seatmapList = await prisma.$queryRaw`
                SELECT 
                    sm.seatMapId, 
                    sm.airlineCode,
                    a.airlineName,
                    sm.aircraftModel,
                    CONCAT('V', sm.version) AS version,
                    (SELECT COUNT(*) FROM seat s WHERE s.seatMapId = sm.seatMapId) AS seatCount,
                    (
                        SELECT GROUP_CONCAT(CONCAT(class_counts.class, ': ', class_counts.seat_count) SEPARATOR ', ')
                        FROM (
                            SELECT s.class, COUNT(*) AS seat_count
                            FROM seat s
                            WHERE s.seatMapId = sm.seatMapId
                            GROUP BY s.class
                        ) AS class_counts
                    ) AS classDistribution
                FROM seatmap_info sm
                JOIN airline a ON sm.airlineCode = a.airlineCode
                WHERE sm.airlineCode LIKE ${wildcard} OR a.airlineName LIKE ${wildcard} OR sm.aircraftModel LIKE ${wildcard}
                ORDER BY sm.airlineCode, aircraftModel, \`version\`
                LIMIT ${limit} OFFSET ${offset};`
            totalCount = await prisma.$queryRaw`
                SELECT COUNT(*) as count
                FROM seatmap_info sm
                JOIN airline a ON sm.airlineCode = a.airlineCode
                WHERE sm.airlineCode LIKE ${wildcard} OR a.airlineName LIKE ${wildcard} OR sm.aircraftModel LIKE ${wildcard};`
        }
        console.log(sanitizeBigInt(seatmapList))
        return {
            status: true,
            msg: "Seatmap list fetched successfully",
            data: sanitizeBigInt(seatmapList),
            pagination: {
                totalCount: Number(totalCount[0].count || 0),
                page: page,
                size: size,
            }
        }
    }catch(err){
        console.error("Error fetching seatmap list:", err);
        return error(500, { 
            status: false,
            msg: "Failed to fetch seatmap list",
            error: (err instanceof Error ? err.toString() : String(err))
        })
    }
})
.get('/seatmap-data/:seatmapId', async ({ params }: { params: { seatmapId: string } }) => {
    const { seatmapId } = params;
    
    try {
        // Fetch seatmap info
        const seatmapInfo = await prisma.$queryRaw`
        SELECT 
            sm.seatMapId, 
            sm.airlineCode,
            a.airlineName,
            sm.aircraftModel,
            sm.version
        FROM seatmap_info sm
        JOIN airline a ON sm.airlineCode = a.airlineCode
        WHERE sm.seatMapId = ${seatmapId}
        LIMIT 1;
        `;
        
        if (!seatmapInfo || !Array.isArray(seatmapInfo) || seatmapInfo.length === 0) {
        return error(404, {
            status: false,
            msg: "Seatmap not found",
        });
        }
        
        // Fetch all distinct classes for this seatmap
        const distinctClasses = await prisma.$queryRaw`
        SELECT DISTINCT class
        FROM seat
        WHERE seatMapId = ${seatmapId};
        `;
        
        // Fetch all seats for this seatmap
        const seats = await prisma.$queryRaw`
            SELECT 
                seatId,
                seatNum,
                \`row\`,
                seatNum REGEXP '[A-Z]$' as hasColumn,
                SUBSTRING(seatNum, LENGTH(REGEXP_REPLACE(seatNum, '[A-Z]+$', '')) + 1) AS \`column\`,
                class,
                price,
                features,
                floor
            FROM seat
            WHERE seatMapId = ${seatmapId}
            ORDER BY \`row\`, seatNum;
        `;
        
        // Format the response in the expected format
        const formattedSeatmap: SeatMap = {
            id: seatmapId,
            airlineCode: seatmapInfo[0].airlineCode,
            airlineName: seatmapInfo[0].airlineName,
            aircraftModel: seatmapInfo[0].aircraftModel,
            version: `V${seatmapInfo[0].version}`,
            classes: sanitizeBigInt(distinctClasses).map((cls: {class: "C" | "Y" | "W" | "F"}) => ({
                id: cls.class.toLowerCase() === 'f' ? 'first' :
                    cls.class.toLowerCase() === 'c' ? 'business' :
                    cls.class.toLowerCase() === 'w' ? 'premium' : 'economy',
                name: classNameMap[cls.class] || `Class ${cls.class}`,
                code: cls.class,
                color: classColorMap[cls.class] || "#cccccc"
            })),
            seats: sanitizeBigInt(seats).map((seat: { seatId: string; seatNum: string; row: number; column: string; class: string; price: number; features: { s: Record<string, unknown>; f: unknown[] }; floor: number }) => {
                // Parse features if it's a string
                let featuresObj = seat.features;
                if (typeof seat.features === 'string') {
                try {
                    featuresObj = JSON.parse(seat.features);
                } catch (e) {
                    featuresObj = { s: {}, f: [] };
                    console.error("Error parsing seat features:", e);
                }
                }
                
                return {
                seatId: seat.seatId,
                seatNum: seat.seatNum,
                row: seat.row,
                column: seat.column || seat.seatNum.replace(String(seat.row), ''),
                class: seat.class,
                price: seat.price,
                features: featuresObj,
                floor: seat.floor
                };
            })
        };
        
        return {
            status: true,
            msg: "Seatmap data fetched successfully",
            data: formattedSeatmap
        };
        
    } catch (err) {
        console.error("Error fetching seatmap data:", err);
        return error(500, {
            status: false,
            msg: "Failed to fetch seatmap data",
            error: (err instanceof Error ? err.toString() : String(err))
        });
    }
}, {
  detail: {
    tags: ['Seatmap'],
    description: 'Get detailed seatmap data by seatmap ID',
    request: {
      params: {
        seatmapId: { type: 'string' }
      },
    },
    responses: {
      200: {
        description: 'Seatmap data fetched successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'boolean' },
                msg: { type: 'string' },
                data: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    airlineCode: { type: 'string' },
                    airlineName: { type: 'string' },
                    aircraftModel: { type: 'string' },
                    version: { type: 'string' },
                    classes: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                          code: { type: 'string' },
                          color: { type: 'string' }
                        }
                      }
                    },
                    seats: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          seatId: { type: 'string' },
                          seatNum: { type: 'string' },
                          row: { type: 'number' },
                          column: { type: 'string' },
                          class: { type: 'string' },
                          price: { type: 'number' },
                          features: { type: 'object' },
                          floor: { type: 'number' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      404: {
        description: 'Seatmap not found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'boolean' },
                msg: { type: 'string' }
              }
            }
          }
        }
      },
      500: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'boolean' },
                msg: { type: 'string' },
                error: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }
});
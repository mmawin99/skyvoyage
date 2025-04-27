import Elysia from "elysia";
import { sanitizeBigInt } from './lib';
import { PrismaClient } from "../../prisma-client";

const prisma = new PrismaClient()

export const seatmapModule = new Elysia({
    prefix: '/seatmap',
}).get('/flight/:flightId/:cabinClass', async ({params} : {params: { flightId: string; cabinClass: string }}) => {
    // Mocked seatmap data
    const seatmap = {
        flightId: params.flightId,
        cabinClass: params.cabinClass,
        seats: [
            { row: 1, seat: 'A', status: 'available' },
            { row: 1, seat: 'B', status: 'booked' },
            { row: 2, seat: 'A', status: 'available' },
            { row: 2, seat: 'B', status: 'available' },
        ],
    };

    return seatmap;
})
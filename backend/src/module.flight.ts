import Elysia, { error, t } from "elysia";
import { PrismaClient} from "../prisma-client";
const prisma = new PrismaClient()

export const userModule = new Elysia({
        prefix: '/flight',
    })
    .post("/addSchedule", async ()=>{
        //กูง่วงละเดี๋ยวมาเขียนต่อ
    })
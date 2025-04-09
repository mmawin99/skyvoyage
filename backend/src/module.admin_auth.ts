import Elysia, { error, t } from "elysia";
import { PrismaClient, User } from '@prisma/client'
const prisma = new PrismaClient()
import * as jose from 'jose'
import { checkPasswordWithHash, hashDataWithSHA256AndSalt, JWT_SECRET } from "../lib";

export const adminAuthModule = new Elysia({
    prefix: '/admin',
    })
    .post("/signin", {

    },{
        tags: ['Admin',"Auth"],
    })
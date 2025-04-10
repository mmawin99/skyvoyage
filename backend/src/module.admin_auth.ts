import Elysia, { error, t } from "elysia";
import { PrismaClient, User } from '@prisma/client'
const prisma = new PrismaClient()
import * as jose from 'jose'
import { checkPasswordWithHash, hashDataWithSHA256AndSalt, JWT_SECRET } from "../lib";

export const adminAuthModule = new Elysia({
    prefix: '/admin',
    })
    .post("/signin", async ({body}:{
        body:{
            username:string, 
            password:string
        }
    })=>{
        const {username, password} = body
        // const {username, password} = body
        // const user = await prisma.user.findFirst({
        //     where:{
        //         username: username,
        //         role: "ADMIN"
        //     }
        // })
        // if(!user){
        //     return error(401, "Invalid username or password")
        // }
        // const isPasswordValid = await checkPasswordWithHash(password, user.password)
        // if(!isPasswordValid){
        //     return error(401, "Invalid username or password")
        // }
        // const jwt = await new jose.SignJWT({id:user.id})
        //     .setProtectedHeader({ alg: 'HS256' })
        //     .setIssuedAt()
        //     .setExpirationTime('2h')
        //     .sign(JWT_SECRET)
        // return {
        //     token: jwt,
        //     user:{
        //         id: user.id,
        //         username: user.username,
        //         email: user.email,
        //         role: user.role
        //     }
        // }
    },{
        tags: ['Admin',"Auth"],
    })
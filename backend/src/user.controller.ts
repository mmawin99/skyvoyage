import Elysia from "elysia";
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export const userController = new Elysia({
    prefix: '/user'
    })
    .post('/register', async (context: {
        body: {
            email: string,
            password: string,
            firstname: string,
            lastname: string,
            phone: string
        }
    })=>{
        return "This is a register user endpoint"
    })
    .post('/login', ()=>{
        return 'This is a login user endpoint'
    })
    .get('/fetch_user', async ()=>{
        const result = await prisma.$queryRaw`SELECT uuid,email,\`password\` FROM user`
        return result
    })
    .post('/auth_admin', (context:{
        body: {
            username: string,
            password: string
        }
    }) => {
        const { body } = context;
        if (body.username === 'admin' && body.password === 'admin') {
            return {
                message: 'Admin Authentication Successful',
                status: true
            };
        } else {
            return {
                message: 'Admin Authentication Failed',
                status: false
            }
        }
    })
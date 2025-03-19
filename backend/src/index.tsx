import { Elysia } from "elysia";
import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'
import { bearer } from '@elysiajs/bearer'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const app = new Elysia()
      .use(cors())
      .use(bearer())
      .use(swagger({
        path: '/docs',
        documentation:{
          info:{
            title: 'SkyVoyage API',
            version: '1.0.0',
            description: 'SkyVoyage Documentation'
          }
        }
      }))
      .get('/', () => 'hi')
      .post('/hello', () => 'world')
      .post('/register', async (context: {
        body:{
          
        }
      })=>{

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
      .listen(4000);

console.log(`🦊 Serving Elysia at ${app.server?.hostname}:${app.server?.port}`);

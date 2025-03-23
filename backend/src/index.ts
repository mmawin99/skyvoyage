import { Elysia } from "elysia";
import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'
import { bearer } from '@elysiajs/bearer'
import { PrismaClient } from '@prisma/client'
import { userController } from "./user.controller";

const prisma = new PrismaClient()
const app = new Elysia()
      .use(cors())
      .use(bearer())
      .use(swagger({
        path: '/v1/docs',
        documentation:{
          info:{
            title: 'SkyVoyage API',
            version: '1.0.0',
            description: 'SkyVoyage Documentation'
          }
        }
      }))
      .use(userController)
      .get('/', () => 'hi')
      .post('/hello', () => 'world')
      .listen(4000);

console.log(`🦊 Serving Elysia at ${app.server?.hostname}:${app.server?.port}`);

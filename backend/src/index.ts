//This is our skyVoyage API, visit http://localhost:4000/v1/docs to see the documentation of our API.
import { Elysia } from "elysia";
import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'
import { bearer } from '@elysiajs/bearer'
import { PrismaClient } from '@prisma/client'
import { userModule } from "./module.user";
import { adminAuthModule } from "./module.admin_auth";

const prisma = new PrismaClient()
const app = new Elysia()
      .use(cors())
      .use(bearer())
      .use(swagger({
        path: '/v1/docs',
        documentation:{
          info:{
            title: 'SkyVoyage API',
            version: '1.0.1',
            description: 'SkyVoyage Documentation'
          },
          tags:[
            {name: 'Auth', description: 'Authentication'},
          ]
        }
      }))
      .use(userModule)       //See module.user.ts       for more information about the api. (Just a simple module to split the code)
      .use(adminAuthModule)  //See module.admin_auth.ts
      ;
      app.listen(4000, ()=>{
        console.log(`🦊 Serving Elysia at http://${app.server?.hostname}:${app.server?.port}`);
        console.log(`🦊 Serving Elysia Swagger at http://${app.server?.hostname}:${app.server?.port}/v1/docs`);
      });
      
      
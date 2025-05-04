//This is our skyVoyage API, visit http://localhost:4000/v1/docs to see the documentation of our API.
import { Elysia } from "elysia";
import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'
import { bearer } from '@elysiajs/bearer'
import { userModule } from "./module.user";
import { adminAuthModule } from "./module.admin_auth";
import { autocompleteModule } from "./module.autocomplete";
import { flightModule } from "./module.flight";
import { seatmapModule } from "./module.seatmap";
import { bookingModule } from "./module.booking";
import { dashboardAdminModule } from "./module.dashboard";

export const app = new Elysia({
   prefix: '/api'
})
      .use(cors({
        origin: [
          /.*\.mwn99\.com$/,
          'localhost:4000',
          'localhost:3000',
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        maxAge: 3600,
      }))
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
            {name: 'Auth', description: 'Authentication for user to sign in and sign up'},
            {name: 'User', description: 'User Endpoints'},
            {name: 'Admin', description: 'Admin Endpoints'},
            {name: 'Autocomplete', description: 'Autocomplete Endpoints'},
            {name: 'Flight', description: 'Flight Search Endpoints'},
          ]
        }
      }))
      .get("/ping",()=> "pong",{
        detail:{
          summary: 'Ping the server',
          description: 'This is a ping endpoint to check if the server is running',
          responses:{
            200:{
              description: 'Pong, the response from the server',
              content:{
                'text/plain':{
                  schema:{
                    type: 'string',
                    example: 'pong'
                  }
                }
              }
            }
          }
        }
      })
      .use(userModule)            //See module.user.ts       for more information about the api. (Just a simple module to split the code)
      .use(adminAuthModule)       //See module.admin_auth.ts
      .use(autocompleteModule)    //See module.autocomplete.ts
      .use(flightModule)          //See module.flight.ts
      .use(seatmapModule)         //See module.seatmap.ts
      .use(bookingModule)         //See module.booking.ts
      .use(dashboardAdminModule)  //See module.dashboard.ts
      ;
      // app.listen(4000, ()=>{
      //   console.log(`| CPE241 Term Project - SkyVoyage API`);
      //   console.log(`| -----------------------------------`);
      //   console.log(`| 🦊 Serving Elysia at http://${app.server?.hostname}:${app.server?.port}`);
      //   console.log(`| 😺 Serving Elysia Swagger at http://${app.server?.hostname}:${app.server?.port}/v1/docs`);
      //   console.log(`| -----------------------------------`);
      // });
      
      
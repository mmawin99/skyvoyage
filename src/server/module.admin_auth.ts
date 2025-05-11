import Elysia, { error } from "elysia";
import { admin as Admin } from "../../prisma-client";
import { hashDataWithSHA256AndSalt } from "@/server/lib";
import { PrismaClient } from "../../prisma-client";

const prisma = new PrismaClient()

export const adminAuthModule = new Elysia({
    prefix: '/admin',
    })
    .post("/adduser", async ({body}:{
        body:{
            username:string, 
            password:string,
            permission:string
        }
    })=>{
        // Example success response:{
        //   "success": true,
        //   "message": "User added successfully"
        // }
        const {username, password, permission} = body
        const hashedPassword = await hashDataWithSHA256AndSalt(password)
        const admin:Admin[] = await prisma.$queryRaw`SELECT username FROM admin WHERE username = ${username}`
        if(admin.length != 0){
            return error(400, {
                message: "Username already exists",
                status: false,
            })
        }else{
            try {
                await prisma.$executeRaw`
                    INSERT INTO admin (username, password, permission) VALUES (${username}, ${hashedPassword}, ${permission})`
                return {
                    status: true,
                    message: "User added successfully",
                }
            }catch(err){
                console.log(err)
                return error(500, {
                    error: err,
                    message: "Internal server error",
                    status: false,
                })
            }
        }
    },{
        detail:{
            tags: ['Admin'],
            description: "Add user for admin",
            requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                username: { type: "string" },
                                password: { type: "string" },
                                permission: { type: "string" }
                            },
                            required: ["username", "password", "permission"]
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "User added successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    status: { type: "boolean" , default: true },
                                    message: { type: "string" , default: "User added successfully" },
                                }
                            }
                        }
                    }
                },
                400:{
                    description:"Username already exists",
                    content:{
                        "application/json":{
                            schema:{
                                type:"object",
                                properties:{
                                    message:{type:"string", default:"Username already exists"},
                                    status:{type:"boolean", default:false}
                                }
                            }
                        }
                    }
                },
                500:{
                    description:"Internal server error",
                    content:{
                        "application/json":{
                            schema:{
                                type:"object",
                                properties:{
                                    message:{type:"string", default:"Internal server error"},
                                    status:{type:"boolean", default:false}
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    .post("/deleteuser", async ({body}:{
        body:{
            id: number
        }
    })=>{
        return error(500, {
            body,
            message: "Internal server error"
        })
    })
  
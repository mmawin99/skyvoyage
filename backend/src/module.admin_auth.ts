import Elysia, { error, t } from "elysia";
import { admin as Admin, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import * as jose from 'jose'
import { checkPasswordWithHash, hashDataWithSHA256AndSalt, JWT_SECRET } from "../lib";

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
        const admin:Admin[] = await prisma.$queryRaw`SELECT * FROM admin WHERE username = ${username}`
        if(admin.length != 0){
            return error(400, {
                message: "Username already exists",
                success: false,
            })
        }else{
            try {
                await prisma.$executeRaw`
                    INSERT INTO admin (username, password, permission) VALUES (${username}, ${hashedPassword}, ${permission})`
                return {
                    success: true,
                    message: "User added successfully",
                }
            }catch(err){
                console.log(err)
                return error(500, {
                    error: err,
                    message: "Internal server error",
                    success: false,
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
                                    success: { type: "boolean" , default: true },
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
                                    success:{type:"boolean", default:false}
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
                                    success:{type:"boolean", default:false}
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    .post("/signin", async ({body}:{
        body:{
            username:string, 
            password:string
        }
    })=>{
        // Example success response:{
        //   "success": true,
        //   "admin": {
        //     "id": 1,
        //     "username": "admin123",
        //     "permission": "MANAGER"
        //   }
        // }
        const {username, password} = body
        const admin:Admin[] = await prisma.$queryRaw`SELECT * FROM admin WHERE username = ${username}`
        if(admin.length == 0){
            console.log("Admin not found", username, password)
            return error(401, {
                message: "Invalid username or password",
                success: false,
            })
        }else{
            console.log("Admin found")
            const adminData = admin[0]
            const comparePassword = await checkPasswordWithHash(password, adminData.password)
            if(comparePassword){
                console.log("Password match")
                return {
                    success: true,
                    message: "Login success",
                    admin: {
                        id: adminData.id,
                        username: adminData.username,
                        permission: adminData.permission,
                    }
                }
            }else{
                return error(401, {
                    message: "Invalid username or password",
                    success: false,
                })
            }
        }
    },{
        detail:{
            tags: ['Admin'],
            description: "Login for admin",
            requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                username: { type: "string" },
                                password: { type: "string" }
                            },
                            required: ["username", "password"]
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Login success",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean" , default: true },
                                    message: { type: "string" , default: "Login success" },
                                    admin: {
                                        type: "object",
                                        properties: {
                                            id: { type: "number" },
                                            username: { type: "string" },
                                            permission: { type: "string" }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                401: {
                    description: "Invalid username or password",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: { type: "string", default: "Invalid username or password" },
                                    success: { type: "boolean", default: false },
                                },
                            }
                        }
                    }
                }
            }
        }
    })
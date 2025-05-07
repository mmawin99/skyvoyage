import { v4 as uuidv4 } from 'uuid'
import Elysia, { error } from "elysia";
import { user as User } from "../../prisma-client";
import * as jose from 'jose'
import { hashDataWithSHA256AndSalt, JWT_SECRET } from "@/server/lib";
import { PrismaClient } from "../../prisma-client";

const prisma = new PrismaClient()

export const userModule = new Elysia({
    prefix: '/user',
    })
    .post('/signup', async (context: {
        body: {
            email: string,
            password: string,
            firstname: string,
            lastname: string,
            phone: string
        }
    })=>{
        try{
            const { email, password, firstname, lastname, phone } = context.body
            const user:User[] = await prisma.$queryRaw`SELECT email FROM user WHERE email = ${email}`
            if(user.length > 0) return error(401, {
                message: 'User already exists',
                status: false,
            })
            
            const hashedPassword = await hashDataWithSHA256AndSalt(password)
            const userUUID = uuidv4()
            const newUser = await prisma.$executeRaw<User>`
                INSERT INTO user (uuid, email, \`password\`, firstname, lastname, phone) 
                VALUES (${userUUID}, ${email}, ${hashedPassword}, ${firstname}, ${lastname}, ${phone})`
            if(!newUser) return error(500, {
                message: 'Failed to create user',
                status: false
            })
            const created_user:User = await prisma.$queryRaw`SELECT uuid,email,firstname,lastname,phone FROM user WHERE email = ${email}`
            if(!created_user) return error(500, {
                message: 'Failed to create user',
                status: false
            })
            return {
                status: true,
                message: 'User created successfully',
                data: created_user
            }
        }catch(err){
            console.log(err)
            return error(500, {
                message: 'Failed to create user',
                status: false
            })
        }
    }, {
        detail: {
            tags: ['Auth'],
            description: 'Register a new user to skyvoyage',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                email: { type: 'string' },
                                password: { type: 'string' },
                                firstname: { type: 'string' },
                                lastname: { type: 'string' },
                                phone: { type: 'string' }
                            }
                        }
                    }
                }
            },
            responses:{
                200:{
                    description: 'User created successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    message: { type: 'string', description: 'User created successfully' },
                                    status: { type: 'boolean' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            uuid: { type: 'string', description: 'User UUID' },
                                            email: { type: 'string', description: 'User email' },
                                            firstname: { type: 'string', description: 'User firstname' },
                                            lastname: { type: 'string', description: 'User lastname' },
                                            phone: { type: 'string', description: 'User phone number' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                401:{
                    description: 'User already exists',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    message: { type: 'string', description: 'User already exists' },
                                    status: { type: 'boolean', default: false }
                                }
                            }
                        }
                    }
                },
                500:{
                    description: 'Failed to create user',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    message: { type: 'string', description: 'Failed to create user' },
                                    status: { type: 'boolean', default: false }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    // .post("/verify", async({ cookie: {skyvoyage_auth}, body }: { cookie:{ skyvoyage_auth: any } })=>{
    //     const cookie_skyvoyage_auth = skyvoyage_auth.value
    //     if(!cookie_skyvoyage_auth) return error(401, {
    //         message: 'Unauthorized',
    //         status: false,
    //     })
        
    //     // verify jwt token from cookie_skyvoyage_auth
    //     const jwt = await jose.jwtVerify(cookie_skyvoyage_auth, JWT_SECRET, {
    //         issuer: 'skyvoyage:v1:signin',
    //         audience: 'skyvoyage:user:auth'
    //     })

    //     if(!jwt) return error(401, {
    //         message: 'Invalid Authorization Token',
    //         status: false,
    //     })
    //     // get uuid from jwt token and fetch user data from database
    //     const uuid = jwt.payload.uuid
    //     const user:User[] = await prisma.$queryRaw`SELECT uuid,email,firstname,lastname,phone FROM user WHERE uuid = ${uuid}`
    //     if(user.length === 0) return error(404, {
    //         message: 'User not found',
    //         status: false,
    //     })
    //     return {
    //         status: true,
    //         message: 'User verified successfully',
    //         data: user[0]
    //     }
    // }, {
    //     detail:{
    //         tags: ['Auth'],
    //         description: 'Token Verification for cookie authorization',
    //         requestBody:{
    //             required: false,
    //             content:{
    //                 'application/json': {
    //                     schema:{
    //                         type:'object',
    //                         properties:{
    //                             // no properties required
    //                         }
    //                     }
    //                 }
    //             }
    //         },
    //         responses:{
    //             200:{
    //                 description: 'User verified successfully',
    //                 content:{
    //                     'application/json':{
    //                         schema:{
    //                             type:'object',
    //                             properties:{
    //                                 message:{type:'string', description:'User verified successfully'},
    //                                 status:{type:'boolean'},
    //                                 data:{
    //                                     type:'object',
    //                                     properties:{
    //                                         uuid:{type:'string', description:'User UUID'},
    //                                         email:{type:'string', description:'User email'},
    //                                         firstname:{type:'string', description:'User firstname'},
    //                                         lastname:{type:'string', description:'User lastname'},
    //                                         phone:{type:'string', description:'User phone number'}
    //                                     }
    //                                 }
    //                             }
    //                         }
    //                     }
    //                 }
    //             },
    //             401:{
    //                 description: 'Unauthorized or Invalid Authorization Token',
    //                 content:{
    //                     'application/json':{
    //                         schema:{
    //                             type:'object',
    //                             properties:{
    //                                 message:{type:'string', description:'Unauthorized or Invalid Authorization Token'},
    //                                 status:{type:'boolean', default: false}
    //                             }
    //                         }
    //                     }
    //                 }
    //             },
    //             404:{
    //                 description: 'User not found',
    //                 content:{
    //                     'application/json':{
    //                         schema:{
    //                             type:'object',
    //                             properties:{
    //                                 message:{type:'string', description:'User not found'},
    //                                 status:{type:'boolean', default: false}
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // })
    .post('/signin', async()=>{
        return error(404,{
            message: 'This endpoint is not available, moved to next-auth endpoint.',
            status: false,
        })
    }, {
        detail: {
            tags: ['Auth'],
            description: 'Login to skyvoyage',
            responses:{
                404:{
                    description: 'Removed to next-auth endpoint',
                    content:{
                        'application/json':{
                            schema:{
                                type:'object',
                                properties:{
                                    message:{type:'string', description:'This endpoint is not available, moved to next-auth endpoint.'},
                                    status:{type:'boolean', default: false}
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    .post("/forgot_password", async({
        cookie: { forgot_session },
        body
    }: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cookie: { forgot_session: any },
        body: {
            email: string,
            phone: string,
            new_password: string
        }
    })=>{
        const cookie_forgot_session = forgot_session.value
        if(cookie_forgot_session){
            const { new_password } = body
            if(!new_password) return error(400, {
                message: 'New password is required',
                status: false,
            })

            //  verify jwt token from cookie_forgot_session
            const jwt = await jose.jwtVerify(cookie_forgot_session, JWT_SECRET, {
                issuer: 'skyvoyage:v1:forgot_password',
                audience: 'skyvoyage:user:auth'
            })
            if(!jwt) return error(401, {
                message: 'Invalid token',
                status: false,
            })
            // get uuid from jwt token and update password in database
            const uuid = jwt.payload.uuid
            const hashedPassword = await hashDataWithSHA256AndSalt(new_password)
            const updatePassword = await prisma.$executeRaw`UPDATE user SET \`password\` = ${hashedPassword} WHERE uuid = ${uuid}`
            if(!updatePassword) return error(500, {
                message: 'Failed to update password',
                status: false,
            })
            // delete cookie_forgot_session
            forgot_session.set({
                maxAge: -10,
                value: "test",
                httpOnly: true,
                secure: true
            })
            return {
                status: true,
                message: 'Password updated successfully',
                data: {
                    uuid: uuid,
                    email: jwt.payload.email
                }
            }

        }else{
            const { email, phone } = body
            const user:User[] = await prisma.$queryRaw`SELECT uuid,email,\`password\`,phone FROM user WHERE email = ${email}`
            if(user.length === 0) return error(404, {
                message: 'User not found',
                status: false,
            })
            if(user[0].phone !== phone) return error(401, {
                message: 'Invalid phone number',
                status: false,
            })
            // Generate JWT token for forgot password session
            const jwtUUID = await new jose.SignJWT({ uuid: user[0].uuid, email: user[0].email }).setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setIssuer('skyvoyage:v1:forgot_password')
            .setAudience('skyvoyage:user:auth')
            .setExpirationTime('30m')
            .sign(JWT_SECRET)

            // Initialize session for forgot password when user isn't logged in and correctly provided email and phone number
            // request to this path again with new_password in body to set new password.
            forgot_session.set({
                maxAge: 30 * 60,
                value: jwtUUID,
                httpOnly: true,
                secure: true
            })

            return {
                status: true,
                message: 'grant access to reset password',
                data: {
                    uuid: user[0].uuid,
                    cookie_forgot_session: cookie_forgot_session,
                    email: user[0].email
                }
            }
        }
    }, {
        detail:{
            tags: ['Auth'],
            description: 'Forgot password',
            requestBody:{
                required: true,
                content:{
                    'application/json': {
                        schema:{
                            type:'object',
                            properties:{
                                email:{type:'string'},
                                phone:{type:'string'},
                                new_password:{type:'string'}
                            }
                        }
                    }
                }
            },
            responses:{
                200:{
                    description: 'grant access to forgot password or update password successfully',
                    content:{
                        'application/json':{
                            schema:{
                                type:'object',
                                properties:{
                                    message:{type:'string', description:'grant access to reset password'},
                                    status:{type:'boolean'},
                                    data:{
                                        type:'object',
                                        properties:{
                                            uuid:{type:'string', description:'User UUID'},
                                            email:{type:'string', description:'User email'}
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                400:{
                    description: 'New password is required',
                    content:{
                        'application/json':{
                            schema:{
                                type:'object',
                                properties:{
                                    message:{type:'string', description:'New password is required'},
                                    status:{type:'boolean', default: false}
                                }
                            }
                        }
                    }
                },
                401:{
                    description: 'Invalid phone number or invalid token',
                    content:{
                        'application/json':{
                            schema:{
                                type:'object',
                                properties:{
                                    message:{type:'string', description:'Invalid phone number or invalid token'},
                                    status:{type:'boolean', default: false}
                                }
                            }
                        }
                    }
                },
                404:{
                    description: 'User not found',
                    content:{
                        'application/json':{
                            schema:{
                                type:'object',
                                properties:{
                                    message:{type:'string', description:'User not found'},
                                    status:{type:'boolean', default: false}
                                }
                            }
                        }
                    }
                },
                500: {
                    description: 'Failed to update password',
                    content:{
                        'application/json':{
                            schema:{
                                type:'object',
                                properties:{
                                    message:{type:'string', description:'Failed to update password'},
                                    status:{type:'boolean', default: false}
                                }
                            }
                        }
                    }
                }
            }
        }
    })
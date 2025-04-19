import Elysia, { error, t } from "elysia";
import { PrismaClient, user as User } from "../prisma-client";
const prisma = new PrismaClient()
import * as jose from 'jose'
import { checkPasswordWithHash, hashDataWithSHA256AndSalt, JWT_SECRET } from "../lib";

export const userModule = new Elysia({
    prefix: '/api/user',
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

            const newUser = await prisma.$executeRaw<User>`
                INSERT INTO user (uuid, email, \`password\`, firstname, lastname, phone) 
                VALUES (UUID(), ${email}, ${hashedPassword}, ${firstname}, ${lastname}, ${phone})`
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
    .post("/verify", async({ cookie: {skyvoyage_auth}, body }: { cookie:{ skyvoyage_auth: any }, body: { } })=>{
        const cookie_skyvoyage_auth = skyvoyage_auth.value
        if(!cookie_skyvoyage_auth) return error(401, {
            message: 'Unauthorized',
            status: false,
        })
        
        // verify jwt token from cookie_skyvoyage_auth
        const jwt = await jose.jwtVerify(cookie_skyvoyage_auth, JWT_SECRET, {
            issuer: 'skyvoyage:v1:signin',
            audience: 'skyvoyage:user:auth'
        })

        if(!jwt) return error(401, {
            message: 'Invalid Authorization Token',
            status: false,
        })
        // get uuid from jwt token and fetch user data from database
        const uuid = jwt.payload.uuid
        const user:User[] = await prisma.$queryRaw`SELECT uuid,email,firstname,lastname,phone FROM user WHERE uuid = ${uuid}`
        if(user.length === 0) return error(404, {
            message: 'User not found',
            status: false,
        })
        return {
            status: true,
            message: 'User verified successfully',
            data: user[0]
        }
    }, {
        detail:{
            tags: ['Auth'],
            description: 'Token Verification for cookie authorization',
            requestBody:{
                required: false,
                content:{
                    'application/json': {
                        schema:{
                            type:'object',
                            properties:{
                                // no properties required
                            }
                        }
                    }
                }
            },
            responses:{
                200:{
                    description: 'User verified successfully',
                    content:{
                        'application/json':{
                            schema:{
                                type:'object',
                                properties:{
                                    message:{type:'string', description:'User verified successfully'},
                                    status:{type:'boolean'},
                                    data:{
                                        type:'object',
                                        properties:{
                                            uuid:{type:'string', description:'User UUID'},
                                            email:{type:'string', description:'User email'},
                                            firstname:{type:'string', description:'User firstname'},
                                            lastname:{type:'string', description:'User lastname'},
                                            phone:{type:'string', description:'User phone number'}
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                401:{
                    description: 'Unauthorized or Invalid Authorization Token',
                    content:{
                        'application/json':{
                            schema:{
                                type:'object',
                                properties:{
                                    message:{type:'string', description:'Unauthorized or Invalid Authorization Token'},
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
                }
            }
        }
    })
    .post('/signin', async({ body }: { body: { email: string, password: string } })=>{
        const { email, password } = body
        const user:User[] = await prisma.$queryRaw`SELECT * FROM user WHERE email = ${email}`
        // console.log(email, password)
        // console.log(user)
        if(user.length === 0) {
            console.log('User not found')
            return error(404, {
                message: 'User not found',
                status: false,
            })
        }
        const isPasswordMatch = await checkPasswordWithHash(password, user[0].password)
        if(!isPasswordMatch){ 
            console.log('Invalid password')
            return error(401, {
                message: 'Invalid password or email',
                status: false,
            })
        }
        // const cred_login = await jwt.sign({ uuid: user[0].uuid })
        // const cred_login = await new jose.SignJWT({ uuid: user[0].uuid, email: user[0].email }).setProtectedHeader({ alg: 'HS256' })
        // .setIssuedAt()
        // .setIssuer('skyvoyage:v1:signin')
        // .setAudience('skyvoyage:user:auth')
        // .setExpirationTime('30d')
        // .sign(JWT_SECRET)

        // skyvoyage_auth.set({
        //     maxAge: 30 * 24 * 60 * 60,
        //     value: cred_login,
        //     httpOnly: true,
        //     secure: true
        // })

        return {
            status: true,
            message: 'Login successful',
            data: {
                uuid: user[0].uuid,
                email: user[0].email,
                firstname: user[0].firstname,
                lastname: user[0].lastname,
            }
        }
    }, {
        detail: {
            tags: ['Auth'],
            description: 'Login to skyvoyage',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                email: { type: 'string' },
                                password: { type: 'string' }
                            }
                        }
                    }
                }
            },
            responses:{
                200:{
                    description: 'Login successful',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    message: { type: 'string', description: 'Login successful' },
                                    status: { type: 'boolean' },
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
                401:{
                    description: 'Invalid password or email',
                    content:{
                        'application/json':{
                            schema:{
                                type:'object',
                                properties:{
                                    message:{type:'string', description:'Invalid password or email'},
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
                }
            }
        }
    })
    .post("/forgot_password", async({
        cookie: { forgot_session },
        body
    }: {
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
import { v4 as uuidv4 } from 'uuid'
import Elysia, { error } from "elysia";
import { admin as Admin, user as User } from "../../prisma-client";
import * as jose from 'jose'
import { hashDataWithSHA256AndSalt, JWT_SECRET } from "@/server/lib";
import { PrismaClient } from "../../prisma-client";
import { SubmitEditAdminProps, SubmitEditUserProps, SubmitUser } from '@/types/type';

const prisma = new PrismaClient()

export const userModule = new Elysia({
    prefix: '/user',
    })
    .post('/signup', async ({body}: {
        body: SubmitUser
    })=>{
        try{
            const { email, password, firstname, lastname, phone } = body
            const user:User[] = await prisma.$queryRaw`SELECT email FROM user WHERE email = ${email}`
            if(user.length > 0) return error(401, {
                message: 'User already exists',
                status: false,
            })
            // check is firstname, lastname is in english and numbers only
            const regex = /^[a-zA-Z0-9]+$/
            if(!regex.test(firstname) || !regex.test(lastname)) return error(401, {
                message: 'Firstname and lastname must be in english and numbers only',
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
    .delete('/delete/:kind/:userId', async ({ params }) => {
        
        try {
            const { kind, userId } = params
            // Use a transaction to ensure all deletions happen atomically
            if(kind == "user") return await prisma.$transaction(async (tx) => {
                // Step 1: Delete all ticket records related to user
                await tx.$queryRaw`
                    DELETE FROM ticket 
                    WHERE userId = ${userId}
                `
                
                // Step 2: Delete all passenger_booking records related to user's passengers
                await tx.$queryRaw`
                    DELETE pb 
                    FROM passenger_booking pb
                    JOIN passenger p ON pb.passportNum = p.passportNum AND pb.userId = p.userId
                    WHERE p.userId = ${userId}
                `
                
                // Step 3: Delete all payments related to user's bookings
                await tx.$queryRaw`
                    DELETE p 
                    FROM payment p
                    JOIN booking b ON p.bookingId = b.bookingId
                    WHERE b.userId = ${userId}
                `
                
                // Step 4: Delete all booking_flight records for user's bookings
                await tx.$queryRaw`
                    DELETE bf 
                    FROM booking_flight bf
                    JOIN booking b ON bf.bookingId = b.bookingId
                    WHERE b.userId = ${userId}
                `
                
                // Step 5: Delete all passenger records for this user
                await tx.$queryRaw`
                    DELETE FROM passenger 
                    WHERE userId = ${userId}
                `
                
                // Step 6: Delete all booking records for this user
                await tx.$queryRaw`
                    DELETE FROM booking 
                    WHERE userId = ${userId}
                `
                
                // Step 7: Finally delete the user
                await tx.$queryRaw`
                    DELETE FROM user 
                    WHERE uuid = ${userId}
                `
                
                return {
                    success: true,
                    message: `User ${userId} and all associated data successfully deleted`,
                    deletedUserId: userId
                }
            })
            if(kind == "admin") return await prisma.$transaction(async (tx) => {
                // Step 1: Delete admin records
                await tx.$queryRaw`
                    DELETE FROM admin 
                    WHERE id = ${userId}
                `
                
                return {
                    success: true,
                    message: `Admin ${userId} and all associated data successfully deleted`,
                    deletedUserId: userId
                }
            })
            return error(400, {
                message: 'Invalid parameter.',
                status: false,
            })
        } catch (error) {
            console.error('Error deleting user:', error)
            return {
                success: false, 
                message: `Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`,
                error
            }
        }
    })
    .put("/edit/:kind", async ({ params, body }:{
        params: {
            kind: "user" | "admin"
        },
        body: SubmitEditAdminProps | SubmitEditUserProps
    }) => {
        const { kind } = params
        try{
            if(kind == "user"){
                const { uuid, email, firstname, lastname, phone, registerDate, password } = body as SubmitEditUserProps
                const user:User[] = await prisma.$queryRaw`SELECT uuid,email FROM user WHERE uuid = ${uuid}`
                if(user.length === 0) return error(404, {
                    message: 'User not found',
                    status: false,
                })
                let hashedPassword;
                if(password.startsWith("$")){
                    hashedPassword = password
                }else{
                    hashedPassword = await hashDataWithSHA256AndSalt(password)
                }
                const updatedUser = await prisma.$executeRaw<User>`
                    UPDATE user 
                    SET email = ${email}, firstname = ${firstname}, 
                        lastname = ${lastname}, phone = ${phone}, \`password\` = ${hashedPassword}, registerDate = ${registerDate}
                    WHERE uuid = ${uuid}
                `
                if(!updatedUser) return error(500, {
                    message: 'Failed to update user',
                    status: false,
                })
                return {
                    status: true,
                    message: 'User updated successfully'
                }
            }else if(kind == "admin"){
                const { id, username, password, permission } = body as SubmitEditAdminProps
                const admin:Admin[] = await prisma.$queryRaw`SELECT id,username FROM admin WHERE id = ${id}`
                if(admin.length === 0) return error(404, {
                    message: 'Admin not found',
                    status: false,
                })

                let hashedPassword;
                if(password.startsWith("$")){
                    hashedPassword = password
                }else{
                    hashedPassword = await hashDataWithSHA256AndSalt(password)
                }

                const updatedAdmin = await prisma.$executeRaw<Admin>`
                    UPDATE admin 
                    SET username = ${username}, \`password\` = ${hashedPassword}, permission = ${permission}
                    WHERE id = ${id}
                `
                if(!updatedAdmin) return error(500, {
                    message: 'Failed to update admin',
                    status: false,
                })

                return {
                    status: true,
                    message: 'Admin updated successfully'
                }
            }
        }catch(err){
            console.error(err)
            return error(500, {
                message: 'Failed to update user',
                status: false
            })
        }
    })

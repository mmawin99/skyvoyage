import Elysia, { error } from "elysia";
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export const userController = new Elysia({
    prefix: '/user',
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
    }, {
        detail: {
            tags: ['Auth'],
            description: 'Register a new user',
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
        }
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
            return error('Unauthorized', {
                message: 'Admin Authentication Failed',
                status: false
            })
        }
    }, {
        detail:{
            tags: ['Auth'],
            description: 'Authenticate an admin user',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                username: { type: 'string' },
                                password: { type: 'string' }
                            }
                        }
                    }
                }
            },
            responses:{
                200:{
                    description: 'Admin Authentication Successful',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    message: { type: 'string', default: 'Admin Authentication Successful' },
                                    status: { type: 'boolean' }
                                }
                            }
                        }
                    }
                },
                401:{
                    description: 'Admin Authentication Failed',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    message: { type: 'string', default: 'Admin Authentication Failed' },
                                    status: { type: 'boolean', default: false }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
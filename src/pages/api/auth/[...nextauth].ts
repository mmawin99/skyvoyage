/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth, { User } from "next-auth"
import { admin as Admin, user as UserPrisma } from "../../../../prisma-client";
// Extend the User type to include the 'role' property
declare module "next-auth" {
  interface User {
    role: string,
    id?: string, // Optional, only for admin
    username?: string, // Optional, only for admin
    permission?: string, // Optional, only for admin
    uuid?: string, // Optional, only for user
    email?: string, // Optional, only for user
    firstname?: string, // Optional, only for user
    lastname?: string, // Optional, only for user
  }

  interface Token {
    role: string,
    id?: string, // Optional, only for admin
    username?: string, // Optional, only for admin
    permission?: string, // Optional, only for admin
    uuid?: string, // Optional, only for user
    email?: string, // Optional, only for user
    firstname?: string, // Optional, only for user
    lastname?: string, // Optional, only for user
}

  interface Session {
    user: User & {
      role: string,
      id?: string,
      username?: string,
      permission?: string,
      uuid?: string,
      email?: string,
      firstname?: string,
      lastname?: string,
    }
  }
}
import CredentialsProvider from "next-auth/providers/credentials"
import { checkPasswordWithHash } from "@/server/lib";
import { PrismaClient } from "../../../../prisma-client";

const prisma = new PrismaClient()

export default NextAuth({
  providers: [
    CredentialsProvider({
      id: "adminSignin",
      name: "Admin",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { username, password } = credentials ?? {}

        if (!username || !password) return null

        // 🟡 Use raw SQL query to fetch admin
        const admin:Admin[] = await prisma.$queryRaw`SELECT * FROM admin WHERE username = ${username}`

        if (admin.length === 0) {
          console.log("Admin not found", username)
          return null
        }

        const adminData = admin[0]
        const isMatch = await checkPasswordWithHash(password, adminData.password)

        if (!isMatch) {
          console.log("Password mismatch for", username)
          return null
        }

        // ✅ Valid admin
        return {
          id: adminData.id.toString(),
          username: adminData.username,
          role: "admin",
          permission: adminData.permission,
        }
      },
    }),
    CredentialsProvider({
      id: "userSignin",
      name: "User",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const password = credentials?.password || ""
        const email = credentials?.email || ""
        const user:UserPrisma[] = await prisma.$queryRaw`SELECT * FROM user WHERE email = ${email}` 
        if(user.length === 0) {
            console.log('User not found')
            return null
        }
        const isPasswordMatch = await checkPasswordWithHash(password, user[0].password)
        if(!isPasswordMatch){ 
            console.log('Invalid password')
            return null
        }
        return {
            role: "user",
            uuid: user[0].uuid,
            email: user[0].email,
            firstname: user[0].firstname,
            lastname: user[0].lastname,
        }

        return null
      },
    }),
  ],

  session: {
    strategy: "jwt", // supports both admin & user in cookie
    maxAge: 60 * 60 * 24 * 7, // 7 days for users
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        if (user.role === "admin") {
          token.id = user.id
          token.username = user.username
          token.permission = user.permission
        } else if (user.role === "user") {
          token.uuid = user.uuid
          token.email = user.email
          token.firstname = user.firstname
          token.lastname = user.lastname
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
      }
      if (token.role === "admin") {
        if (session.user) {
          session.user.id = token.id as string
          session.user.username = token.username as string
          session.user.permission = token.permission as string
        }
      } else if (token.role === "user") {
        session.user.uuid = token.uuid as string
        session.user.email = token.email as string
        session.user.firstname = token.firstname as string
        session.user.lastname = token.lastname as string
      }
      return session
    },
  },

  pages: {
    signIn: "/auth/login",
  },
})
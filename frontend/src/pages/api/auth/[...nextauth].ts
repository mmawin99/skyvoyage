/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth, { User } from "next-auth"

const BackendBaseURL = process.env.BACKEND_URL || "http://localhost:4000"

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
        const res = await fetch(`${BackendBaseURL}/admin/signin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        })

        const data = await res.json()
        if (res.ok && data.success) {
          return {
            role: "admin",
            id: data.admin.id,
            username: data.admin.username,
            permission: data.admin.permission,
          }
        }

        return null
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
        const res = await fetch(`${BackendBaseURL}/api/user/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        })

        const data = await res.json()
        if (res.ok && data.success) {
          return {
            id: data.user.uuid, // Add 'id' property to conform to User type
            role: "user",
            uuid: data.user.uuid,
            email: data.user.email,
            firstname: data.user.firstname,
            lastname: data.user.lastname,
          }
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
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log("=== AUTH DEBUG START ===")
          console.log("Email:", credentials?.email)
          console.log("Password provided:", !!credentials?.password)
          
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials - returning null")
            return null
          }

          console.log("Looking up user in database...")
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          console.log("User found:", !!user)
          if (user) {
            console.log("User ID:", user.id)
            console.log("User name:", user.name)
            console.log("Password hash exists:", !!user.password)
            console.log("Password hash length:", user.password?.length || 0)
          } else {
            console.log("User not found - returning null")
            return null
          }

          if (!user.password) {
            console.log("User has no password - returning null")
            return null
          }

          console.log("Comparing passwords...")
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          console.log("Password comparison result:", isPasswordValid)
          
          if (!isPasswordValid) {
            console.log("Password invalid - returning null")
            return null
          }

          console.log("=== AUTH SUCCESS ===")
          console.log("Returning user:", { id: user.id, email: user.email, name: user.name })
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  debug: true,
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    }
  }
}

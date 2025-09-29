import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/auth-utils"

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
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required")
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email.toLowerCase().trim()
            }
          })

          if (!user || !user.password) {
            throw new Error("Invalid credentials")
          }

          // Check if email is verified
          if (!user.emailVerified) {
            throw new Error("Please verify your email address before signing in")
          }

          // Check if account is locked
          if (user.lockedUntil && new Date() < user.lockedUntil) {
            const lockoutMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (1000 * 60))
            throw new Error(`Account is locked. Try again in ${lockoutMinutes} minutes`)
          }

          const isPasswordValid = await verifyPassword(credentials.password, user.password)
          
          if (!isPasswordValid) {
            // Increment failed login attempts
            const newFailedAttempts = user.failedLoginAttempts + 1
            const updateData: any = { failedLoginAttempts: newFailedAttempts }
            
            // Lock account after 5 failed attempts
            if (newFailedAttempts >= 5) {
              updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
            }
            
            await prisma.user.update({
              where: { id: user.id },
              data: updateData
            })
            
            throw new Error("Invalid credentials")
          }

          // Reset failed login attempts on successful login
          if (user.failedLoginAttempts > 0) {
            await prisma.user.update({
              where: { id: user.id },
              data: { 
                failedLoginAttempts: 0,
                lockedUntil: null
              }
            })
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            isActive: user.isActive,
          }
        } catch (error) {
          console.error("Auth error:", error)
          throw error
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.isActive = user.isActive
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string
        (session.user as any).role = token.role as string
        (session.user as any).isActive = token.isActive as boolean
      }
      return session
    }
  }
}

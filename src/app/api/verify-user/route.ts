import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: "Email is required"
      }, { status: 400 })
    }

    // Find the user and mark email as verified
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found"
      }, { status: 404 })
    }

    // Mark email as verified
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { 
        emailVerified: new Date(),
        isActive: true 
      }
    })

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role
      }
    })
    
  } catch (error) {
    console.error("Verify user error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

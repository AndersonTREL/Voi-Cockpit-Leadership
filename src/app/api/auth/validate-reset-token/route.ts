import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isTokenExpired } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      )
    }

    // Find user with this reset token
    const user = await prisma.user.findFirst({
      where: { resetToken: token }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (!user.resetTokenExpiry || isTokenExpired(user.resetTokenExpiry)) {
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Reset token is valid'
    }, { status: 200 })

  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      { error: 'An error occurred during token validation' },
      { status: 500 }
    )
  }
}

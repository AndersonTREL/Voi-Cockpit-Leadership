import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isTokenExpired } from '@/lib/auth-utils'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: { verificationToken: token }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      )
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email is already verified' },
        { status: 200 }
      )
    }

    // Check if token is expired (24 hours)
    const tokenAge = Date.now() - new Date(user.createdAt).getTime()
    const twentyFourHours = 24 * 60 * 60 * 1000

    if (tokenAge > twentyFourHours) {
      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400 }
      )
    }

    // Verify the email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null, // Clear the token
      }
    })

    // Send welcome email
    const emailResult = await sendWelcomeEmail(
      user.email,
      user.name || undefined
    )

    if (!emailResult.success) {
      console.error('Failed to send welcome email:', emailResult.error)
      // Don't fail verification if email fails
    }

    return NextResponse.json({
      message: 'Email verified successfully! You can now sign in to your account.'
    }, { status: 200 })

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'An error occurred during email verification' },
      { status: 500 }
    )
  }
}
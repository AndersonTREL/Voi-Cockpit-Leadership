import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateVerificationToken } from '@/lib/auth-utils'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: { verificationToken: token }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
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

    // Generate new verification token
    const newVerificationToken = generateVerificationToken()

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: newVerificationToken,
        updatedAt: new Date(), // Reset the creation time for token expiry
      }
    })

    // Send new verification email
    const emailResult = await sendVerificationEmail(
      user.email,
      newVerificationToken,
      user.name || undefined
    )

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Verification email sent successfully!'
    }, { status: 200 })

  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'An error occurred while resending verification email' },
      { status: 500 }
    )
  }
}

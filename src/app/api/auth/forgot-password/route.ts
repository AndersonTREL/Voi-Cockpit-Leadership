import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateResetToken, validateEmail } from '@/lib/auth-utils'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Generate reset token
      const resetToken = generateResetToken()
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Update user with reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        }
      })

      // Send password reset email
      const emailResult = await sendPasswordResetEmail(
        user.email,
        resetToken,
        user.name || undefined
      )

      if (!emailResult.success) {
        console.error('Failed to send password reset email:', emailResult.error)
        // Don't fail the request if email fails
      }
    }

    // Always return success message
    return NextResponse.json({
      message: 'If an account with that email exists, we\'ve sent a password reset link.'
    }, { status: 200 })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, validatePassword, isTokenExpired } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    // Validate input
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
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

    // Hash new password
    const hashedPassword = await hashPassword(password)

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        failedLoginAttempts: 0, // Reset failed attempts
        lockedUntil: null, // Unlock account if locked
        emailVerified: new Date(), // Auto-verify email since they have access to reset password
      }
    })

    return NextResponse.json({
      message: 'Password reset successfully! You can now sign in with your new password.'
    }, { status: 200 })

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'An error occurred during password reset' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateVerificationToken, validateEmail, validatePassword } from '@/lib/auth-utils'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    console.log("=== REGISTRATION DEBUG START ===")
    const { name, email, password } = await request.json()
    console.log("Received data:", { name, email, password: !!password })

    // Validate input
    if (!name || !email || !password) {
      console.log("Missing required fields")
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!validateEmail(email)) {
      console.log("Invalid email format")
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      console.log("Password validation failed:", passwordValidation.errors)
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
        { status: 400 }
      )
    }

    console.log("Validations passed, checking for existing user...")
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (existingUser) {
      console.log("User already exists")
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    console.log("Creating user in database...")
    // Hash password
    const hashedPassword = await hashPassword(password)

    // Generate verification token
    const verificationToken = generateVerificationToken()

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        verificationToken,
        emailVerified: null, // Will be set when email is verified
      }
    })

    console.log("User created successfully:", user.id)

    // Send verification email
    console.log("Sending verification email...")
    try {
      const emailResult = await sendVerificationEmail(
        user.email,
        verificationToken,
        user.name || undefined
      )

      if (!emailResult.success) {
        console.error('Failed to send verification email:', emailResult.error)
        // Don't fail registration if email fails, just log it
      } else {
        console.log("Verification email sent successfully")
      }
    } catch (emailError) {
      console.error('Error during email sending:', emailError)
      // Don't fail registration if email fails
    }

    // Return success (don't include sensitive data)
    console.log("Registration completed successfully")
    return NextResponse.json({
      message: 'Registration successful. Please check your email to verify your account.',
      userId: user.id
    }, { status: 201 })

  } catch (error) {
    console.error('=== REGISTRATION ERROR ===')
    console.error('Error details:', error)
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'An error occurred during registration. Please try again.' },
      { status: 500 }
    )
  }
}

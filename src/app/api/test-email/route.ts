import { NextResponse } from "next/server"
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { email, type = 'verification' } = await request.json()
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: "Email is required"
      }, { status: 400 })
    }

    const testToken = "test-token-" + Date.now()
    
    let result
    if (type === 'verification') {
      result = await sendVerificationEmail(email, testToken, "Test User")
    } else if (type === 'reset') {
      result = await sendPasswordResetEmail(email, testToken, "Test User")
    } else {
      return NextResponse.json({
        success: false,
        error: "Invalid type. Use 'verification' or 'reset'"
      }, { status: 400 })
    }

    return NextResponse.json({
      success: result.success,
      message: `Test ${type} email sent to ${email}`,
      error: result.error || null
    })
    
  } catch (error) {
    console.error("Test email error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

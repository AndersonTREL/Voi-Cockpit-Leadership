import nodemailer from 'nodemailer'

// Development mode: Use a mock transporter that logs emails instead of sending them
const isDevelopment = process.env.NODE_ENV === 'development' && !process.env.SMTP_USER

let transporter: nodemailer.Transporter

if (isDevelopment) {
  // Mock transporter for development
  transporter = nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true
  })
} else {
  // Production transporter with proper authentication
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })
}

export async function sendVerificationEmail(email: string, token: string, name?: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001'
  const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`
  
  const mailOptions = {
    from: `"VOI Cockpit" <${process.env.SMTP_USER || 'noreply@voicockpit.com'}>`,
    to: email,
    subject: 'Verify your email address - VOI Cockpit',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #134e5e 0%, #71b280 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">VOI Cockpit - Leadership</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome${name ? ` ${name}` : ''}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for registering with VOI Cockpit. Please verify your email address to complete your registration.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: linear-gradient(45deg, #134e5e, #71b280); 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;
                      font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #134e5e;">${verificationUrl}</a>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This link will expire in 24 hours. If you didn't create an account, please ignore this email.
          </p>
        </div>
        <div style="background: #134e5e; padding: 15px; text-align: center;">
          <p style="color: white; margin: 0; font-size: 12px;">
            © 2025 Anderson Meta. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }

  try {
    if (isDevelopment) {
      // In development mode, log the email instead of sending it
      console.log('📧 VERIFICATION EMAIL (Development Mode):')
      console.log('To:', email)
      console.log('Subject:', mailOptions.subject)
      console.log('Verification URL:', verificationUrl)
      console.log('---')
      return { success: true }
    } else {
      await transporter.sendMail(mailOptions)
      return { success: true }
    }
  } catch (error) {
    console.error('Error sending verification email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function sendPasswordResetEmail(email: string, token: string, name?: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001'
  const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`
  
  const mailOptions = {
    from: `"VOI Cockpit" <${process.env.SMTP_USER || 'noreply@voicockpit.com'}>`,
    to: email,
    subject: 'Reset your password - VOI Cockpit',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #134e5e 0%, #71b280 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">VOI Cockpit - Leadership</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
          <p style="color: #666; line-height: 1.6;">
            Hi${name ? ` ${name}` : ''},<br><br>
            We received a request to reset your password for your VOI Cockpit account.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(45deg, #134e5e, #71b280); 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;
                      font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #134e5e;">${resetUrl}</a>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
          </p>
        </div>
        <div style="background: #134e5e; padding: 15px; text-align: center;">
          <p style="color: white; margin: 0; font-size: 12px;">
            © 2025 Anderson Meta. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }

  try {
    if (isDevelopment) {
      // In development mode, log the email instead of sending it
      console.log('📧 PASSWORD RESET EMAIL (Development Mode):')
      console.log('To:', email)
      console.log('Subject:', mailOptions.subject)
      console.log('Reset URL:', resetUrl)
      console.log('---')
      return { success: true }
    } else {
      await transporter.sendMail(mailOptions)
      return { success: true }
    }
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function sendWelcomeEmail(email: string, name?: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001'
  const loginUrl = `${baseUrl}/auth/signin`
  
  const mailOptions = {
    from: `"VOI Cockpit" <${process.env.SMTP_USER || 'noreply@voicockpit.com'}>`,
    to: email,
    subject: 'Welcome to VOI Cockpit - Your account is ready!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #134e5e 0%, #71b280 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">VOI Cockpit - Leadership</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to VOI Cockpit!</h2>
          <p style="color: #666; line-height: 1.6;">
            Hi${name ? ` ${name}` : ''},<br><br>
            Your email has been verified and your account is now active. You can now access the VOI Cockpit Leadership Portal.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" 
               style="background: linear-gradient(45deg, #134e5e, #71b280); 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;
                      font-weight: bold;">
              Access VOI Cockpit
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${loginUrl}" style="color: #134e5e;">${loginUrl}</a>
          </p>
        </div>
        <div style="background: #134e5e; padding: 15px; text-align: center;">
          <p style="color: white; margin: 0; font-size: 12px;">
            © 2025 Anderson Meta. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }

  try {
    if (isDevelopment) {
      // In development mode, log the email instead of sending it
      console.log('📧 WELCOME EMAIL (Development Mode):')
      console.log('To:', email)
      console.log('Subject:', mailOptions.subject)
      console.log('Login URL:', loginUrl)
      console.log('---')
      return { success: true }
    } else {
      await transporter.sendMail(mailOptions)
      return { success: true }
    }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

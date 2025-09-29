# Authentication Setup Guide

## Overview
This application now includes a complete user registration and authentication system with email verification, password reset, and security features.

## Features Implemented

### 🔐 **User Registration & Authentication**
- User registration with email verification
- Secure password hashing with bcrypt
- Email verification required before login
- Password strength validation
- Account lockout protection (5 failed attempts = 30 min lockout)

### 📧 **Email System**
- Email verification on registration
- Password reset via email
- Welcome email after verification
- Professional email templates with TREE LOGISTICS branding

### 🛡️ **Security Features**
- Password strength requirements (8+ chars, uppercase, lowercase, number, special char)
- Account lockout after failed login attempts
- Secure password reset tokens (1 hour expiry)
- Email verification tokens (24 hour expiry)
- CSRF protection via NextAuth

### 🔄 **Password Management**
- Forgot password functionality
- Secure password reset via email
- Password strength indicator
- Password confirmation validation

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in the project root with:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### 2. Email Setup (Gmail Example)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password as `SMTP_PASS`

### 3. Database Migration
The database schema has been updated. Run:
```bash
npx prisma db push
```

### 4. Start the Application
```bash
npm run dev
```

## Authentication Flow

### Registration Flow
1. User visits `/auth/register`
2. Fills out registration form with validation
3. System creates user account with hashed password
4. Verification email sent to user
5. User clicks verification link in email
6. Email verified, welcome email sent
7. User can now sign in

### Login Flow
1. User visits `/auth/signin`
2. Enters email and password
3. System validates credentials and email verification
4. Account lockout checked
5. Failed attempts tracked
6. Successful login creates session

### Password Reset Flow
1. User visits `/auth/forgot-password`
2. Enters email address
3. Reset token generated and sent via email
4. User clicks reset link in email
5. User enters new password with validation
6. Password updated, user can sign in

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/validate-reset-token` - Validate reset token
- `POST /api/auth/reset-password` - Reset password

### Pages
- `/auth/signin` - Sign in page
- `/auth/register` - Registration page
- `/auth/verify-email` - Email verification page
- `/auth/forgot-password` - Forgot password page
- `/auth/reset-password` - Reset password page

## Security Considerations

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Account Protection
- 5 failed login attempts = 30 minute lockout
- Email verification required before login
- Secure password reset tokens (1 hour expiry)
- Password hashing with bcrypt (12 rounds)

### Email Security
- Verification tokens expire after 24 hours
- Reset tokens expire after 1 hour
- Email enumeration protection (same response for valid/invalid emails)

## Testing the System

### 1. Registration Test
1. Go to `/auth/register`
2. Fill out the form with a valid email
3. Check your email for verification link
4. Click verification link
5. Try to sign in

### 2. Password Reset Test
1. Go to `/auth/forgot-password`
2. Enter your registered email
3. Check email for reset link
4. Click reset link and set new password
5. Sign in with new password

### 3. Security Test
1. Try to sign in with wrong password 5 times
2. Account should be locked for 30 minutes
3. Try to sign in with unverified email
4. Should get verification required message

## Troubleshooting

### Email Not Sending
- Check SMTP credentials in `.env.local`
- Verify Gmail App Password is correct
- Check spam folder
- Ensure 2FA is enabled on Gmail

### Database Issues
- Run `npx prisma db push` to update schema
- Check database file permissions
- Verify DATABASE_URL is correct

### Authentication Issues
- Check NEXTAUTH_SECRET is set
- Verify NEXTAUTH_URL matches your domain
- Check browser console for errors

## Production Deployment

### Environment Variables
Update environment variables for production:
- Use production database URL
- Set secure NEXTAUTH_SECRET
- Configure production email service
- Set correct NEXTAUTH_URL

### Email Service
Consider using a professional email service:
- SendGrid
- Resend
- AWS SES
- Mailgun

### Security
- Use HTTPS in production
- Set secure session cookies
- Implement rate limiting
- Monitor failed login attempts

## Support

For issues or questions:
- Email: andersonmeta1996@gmail.com
- Phone: +49 176 166 26841

© 2025 Anderson Meta. All rights reserved.

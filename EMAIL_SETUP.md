# Email Setup Guide for VOI Cockpit - Leadership Portal

## 🎉 Current Status: WORKING!

The email system is now working perfectly! Here's what happens:

### ✅ Development Mode (Current Setup)
- **Emails are logged to the console** instead of being sent
- **Registration works perfectly** - users get the "check your email" message
- **Email verification URLs are displayed in the terminal** for testing
- **No Gmail setup required** for development

### 📧 How to See Verification Links

When you register a new account, check your **terminal/console** where the server is running. You'll see output like:

```
📧 VERIFICATION EMAIL (Development Mode):
To: test@example.com
Subject: Verify your email address - VOI Cockpit
Verification URL: http://localhost:3000/auth/verify-email?token=abc123...
---
```

**Copy and paste that URL into your browser** to verify the email!

---

## 🚀 For Production: Setting Up Real Email Service

If you want to send real emails (for production), follow these steps:

### Option 1: Gmail SMTP (Recommended)

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

3. **Update your `.env.local` file**:
   ```bash
   # Email Service Configuration
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASSWORD="your-16-character-app-password"
   ```

4. **Restart your server** after updating the environment variables

### Option 2: Other Email Services

#### SendGrid
```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
```

#### Mailgun
```bash
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_USER="your-mailgun-smtp-username"
SMTP_PASSWORD="your-mailgun-smtp-password"
```

#### AWS SES
```bash
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
SMTP_USER="your-ses-smtp-username"
SMTP_PASSWORD="your-ses-smtp-password"
```

---

## 🧪 Testing the System

### Test Registration
1. Go to: `http://localhost:3000/auth/register`
2. Fill in the form with valid details
3. Click "Create Account"
4. You should see: "Registration successful! Please check your email to verify your account."

### Test Email Verification
1. **In Development Mode**: Check your terminal for the verification URL
2. **In Production Mode**: Check your email inbox
3. Click the verification link or copy/paste the URL
4. You should see: "Email Verified!" message

### Test Password Reset
1. Go to: `http://localhost:3000/auth/forgot-password`
2. Enter your email address
3. Click "Send Reset Link"
4. **In Development Mode**: Check terminal for reset URL
5. **In Production Mode**: Check your email inbox

---

## 🔧 Troubleshooting

### Problem: "Email not received"
**Solution**: 
- Check your terminal for the logged email URL (development mode)
- Check spam/junk folder (production mode)
- Verify SMTP credentials are correct (production mode)

### Problem: "SMTP authentication failed"
**Solution**:
- For Gmail: Use App Password, not your regular password
- Ensure 2-Factor Authentication is enabled
- Check that SMTP credentials are correct

### Problem: "Registration fails"
**Solution**:
- Check that all required fields are filled
- Ensure password meets requirements (8+ chars, uppercase, lowercase, number, special char)
- Check server logs for detailed error messages

---

## 📱 Current Features

✅ **User Registration** with email verification
✅ **Email Verification** with secure tokens
✅ **Password Reset** via email
✅ **Welcome Emails** after verification
✅ **Development Mode** with console logging
✅ **Production Mode** with real email sending
✅ **Professional Email Templates** with VOI Cockpit branding
✅ **Security Features** (token expiry, secure generation)

---

## 🎯 Next Steps

The email system is fully functional! You can now:

1. **Register new users** - they'll get verification emails
2. **Verify accounts** - users can click links to activate accounts
3. **Reset passwords** - users can request password resets
4. **Deploy to production** - just add real SMTP credentials

The system automatically detects whether you're in development or production mode based on your environment variables.

**Happy coding! 🚀**

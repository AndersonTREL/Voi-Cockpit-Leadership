# 📧 Email Setup Guide for VOI Cockpit Leadership

This guide will help you set up email functionality so users can receive verification emails and password reset emails from your admin account (`andersonmeta1996@gmail.com`).

## 🔐 Gmail App Password Setup

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Sign in with `andersonmeta1996@gmail.com`
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the setup process to enable 2FA

### Step 2: Generate App Password
1. Still in [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click **App passwords**
3. Select **Mail** and **Other (custom name)**
4. Enter "VOI Cockpit Leadership" as the app name
5. Click **Generate**
6. **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)

### Step 3: Update Heroku Configuration
Run this command with your actual app password:

```bash
heroku config:set SMTP_PASSWORD=your-16-character-app-password --app voi-cockpit-leadership
```

**Example:**
```bash
heroku config:set SMTP_PASSWORD=abcd efgh ijkl mnop --app voi-cockpit-leadership
```

## ✅ Verify Email Configuration

After setting up the app password, check your configuration:

```bash
heroku config --app voi-cockpit-leadership
```

You should see:
```
SMTP_HOST: smtp.gmail.com
SMTP_PORT: 587
SMTP_USER: andersonmeta1996@gmail.com
SMTP_PASSWORD: your-app-password
```

## 🧪 Test Email Functionality

### Test 1: User Registration
1. Go to: `https://voi-cockpit-leadership.herokuapp.com`
2. Click "Create an account"
3. Register with a test email
4. Check if verification email arrives

### Test 2: Password Reset
1. Go to the login page
2. Click "Forgot password?"
3. Enter a registered email
4. Check if reset email arrives

## 📧 Email Templates

The system sends three types of emails:

### 1. Email Verification
- **From:** "VOI Cockpit - Anderson Meta" <andersonmeta1996@gmail.com>
- **Subject:** "Verify your email address - VOI Cockpit"
- **Purpose:** Verify new user accounts

### 2. Password Reset
- **From:** "VOI Cockpit - Anderson Meta" <andersonmeta1996@gmail.com>
- **Subject:** "Reset your password - VOI Cockpit"
- **Purpose:** Reset forgotten passwords

### 3. Welcome Email
- **From:** "VOI Cockpit - Anderson Meta" <andersonmeta1996@gmail.com>
- **Subject:** "Welcome to VOI Cockpit - Your account is ready!"
- **Purpose:** Confirm successful email verification

## 🔧 Troubleshooting

### Emails Not Sending?
1. **Check App Password:** Make sure you're using the 16-character app password, not your regular Gmail password
2. **Check 2FA:** Ensure 2-Factor Authentication is enabled
3. **Check Heroku Logs:** `heroku logs --app voi-cockpit-leadership --tail`
4. **Test Configuration:** The system will log email attempts in development mode

### Common Issues:
- **"Invalid credentials"**: Wrong app password
- **"Less secure app access"**: Enable 2FA and use app password instead
- **"Connection timeout"**: Check SMTP_HOST and SMTP_PORT settings

## 🚀 Production Ready

Once configured, your application will:
- ✅ Send verification emails for new registrations
- ✅ Send password reset emails
- ✅ Send welcome emails after verification
- ✅ Use your admin email as the sender
- ✅ Include professional email templates

## 📞 Support

If you need help with email setup:
1. Check the Heroku logs for error messages
2. Verify your Gmail app password is correct
3. Ensure 2FA is enabled on your Gmail account
4. Test with a simple email first

---

**Note:** Keep your Gmail app password secure and don't share it publicly!

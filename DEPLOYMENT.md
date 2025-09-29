# 🚀 Deployment Guide

This guide will help you deploy the SCC Task Manager to various platforms for team collaboration.

## 📋 Prerequisites

- GitHub account
- Node.js 18+ installed locally
- Git installed locally

## 🌐 Deployment Options

### Option 1: Vercel (Recommended - Easiest)

**Vercel** is the easiest platform for deploying Next.js applications with automatic deployments from GitHub.

#### Steps:
1. **Push your code to GitHub** (follow the GitHub setup steps below)
2. **Go to [vercel.com](https://vercel.com)** and sign up with GitHub
3. **Import your repository**:
   - Click "New Project"
   - Select your `scc-task-manager` repository
   - Click "Import"
4. **Configure environment variables**:
   - In the Vercel dashboard, go to your project settings
   - Add the following environment variables:
     ```
     NEXTAUTH_SECRET=your-secret-key-here
     NEXTAUTH_URL=https://your-app-name.vercel.app
     DATABASE_URL=your-production-database-url
     EMAIL_SERVER_HOST=your-smtp-host
     EMAIL_SERVER_PORT=587
     EMAIL_SERVER_USER=your-email
     EMAIL_SERVER_PASSWORD=your-password
     EMAIL_FROM=noreply@yourdomain.com
     NEXT_PUBLIC_SOCKET_IO_URL=https://your-app-name.vercel.app
     ```
5. **Deploy**: Vercel will automatically deploy your app
6. **Share the URL** with your team: `https://your-app-name.vercel.app`

#### Database Options for Vercel:
- **Vercel Postgres** (Built-in)
- **PlanetScale** (MySQL)
- **Supabase** (PostgreSQL)
- **Railway** (PostgreSQL)

### Option 2: Railway

**Railway** provides full-stack deployment with built-in databases.

#### Steps:
1. **Go to [railway.app](https://railway.app)** and sign up with GitHub
2. **Create new project** from your GitHub repository
3. **Add PostgreSQL database**:
   - Click "New" → "Database" → "PostgreSQL"
4. **Configure environment variables** in Railway dashboard
5. **Deploy**: Railway will automatically deploy your app

### Option 3: Netlify

**Netlify** is great for static sites but requires additional setup for full-stack apps.

#### Steps:
1. **Go to [netlify.com](https://netlify.com)** and sign up
2. **Connect your GitHub repository**
3. **Configure build settings**:
   - Build command: `npm run build`
   - Publish directory: `out`
4. **Add environment variables** in Netlify dashboard
5. **Deploy**

### Option 4: DigitalOcean App Platform

**DigitalOcean** provides scalable cloud deployment.

#### Steps:
1. **Go to [cloud.digitalocean.com](https://cloud.digitalocean.com)**
2. **Create new app** from GitHub repository
3. **Configure environment variables**
4. **Deploy**

## 🗄️ Database Setup for Production

### For PostgreSQL (Recommended):

1. **Create database** on your chosen platform
2. **Get connection string** (usually provided automatically)
3. **Update DATABASE_URL** in environment variables:
   ```
   DATABASE_URL="postgresql://username:password@hostname:port/database_name"
   ```

### Database Migration:

After setting up the production database, run:
```bash
# Generate Prisma client
npm run db:generate

# Push schema to production database
npx prisma db push

# Seed initial data
npm run db:seed
```

## 📧 Email Configuration

For production email functionality, configure SMTP settings:

### Gmail SMTP:
```
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-gmail@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

### SendGrid:
```
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com
```

## 🔐 Security Configuration

### Generate NEXTAUTH_SECRET:
```bash
# Generate a random secret
openssl rand -base64 32
```

### Update NEXTAUTH_URL:
- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

## 👥 Team Access

### Adding Team Members:

1. **Admin Access**: 
   - First user registered becomes admin automatically
   - Admin can create other users through the admin panel

2. **User Registration**:
   - Team members can register with their email
   - Email verification required
   - Admin can approve/activate users

3. **Role Assignment**:
   - Admin assigns roles (Administrator, Manager, User, Viewer)
   - Role-based permissions control access

## 🔄 Continuous Deployment

### Automatic Deployments:
- **Vercel**: Automatically deploys on every push to main branch
- **Railway**: Automatically deploys on every push to main branch
- **Netlify**: Automatically deploys on every push to main branch

### Manual Deployments:
- Push changes to GitHub
- Platform automatically detects changes and redeploys
- Usually takes 2-5 minutes

## 📊 Monitoring & Analytics

### Built-in Features:
- **Activity Feed**: Track all user actions
- **User Management**: Monitor user activity
- **Task Analytics**: View task completion rates
- **Export Reports**: Generate team performance reports

### Additional Monitoring:
- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking and performance monitoring
- **Google Analytics**: User behavior tracking

## 🆘 Troubleshooting

### Common Issues:

1. **Database Connection Errors**:
   - Check DATABASE_URL format
   - Ensure database is accessible
   - Verify credentials

2. **Email Not Working**:
   - Check SMTP settings
   - Verify email credentials
   - Check spam folder

3. **Authentication Issues**:
   - Verify NEXTAUTH_SECRET
   - Check NEXTAUTH_URL
   - Ensure HTTPS in production

4. **Build Failures**:
   - Check Node.js version (18+)
   - Verify all dependencies installed
   - Check for TypeScript errors

### Getting Help:
- Check the application logs in your deployment platform
- Review the GitHub issues
- Contact the development team

## 🎯 Next Steps After Deployment

1. **Test the application** thoroughly
2. **Share the URL** with your team
3. **Create initial users** through admin panel
4. **Set up email notifications**
5. **Configure custom domain** (optional)
6. **Set up monitoring** and backups

---

**Your team is now ready to collaborate efficiently with the SCC Task Manager! 🎉**

# Heroku Deployment Guide

## Prerequisites
1. Heroku account (free tier available)
2. Heroku CLI installed
3. Git repository pushed to GitHub

## Step 1: Create Heroku App

```bash
# Login to Heroku
heroku login

# Create a new Heroku app
heroku create voi-cockpit-leadership

# Or create with a specific name
heroku create your-app-name
```

## Step 2: Add PostgreSQL Database

```bash
# Add PostgreSQL addon (free tier)
heroku addons:create heroku-postgresql:mini

# Check database URL
heroku config:get DATABASE_URL
```

## Step 3: Set Environment Variables

```bash
# Set all required environment variables
heroku config:set NEXTAUTH_URL=https://your-app-name.herokuapp.com
heroku config:set NEXTAUTH_SECRET=your-secret-key-here
heroku config:set NEXT_PUBLIC_SOCKET_IO_URL=https://your-app-name.herokuapp.com

# The DATABASE_URL is automatically set by the PostgreSQL addon
```

## Step 4: Deploy to Heroku

```bash
# Add Heroku remote
heroku git:remote -a your-app-name

# Deploy
git push heroku main

# Or if your main branch is called master
git push heroku master
```

## Step 5: Setup Database

```bash
# Run database migrations
heroku run npx prisma db push

# Seed the database
heroku run npx prisma db seed
```

## Step 6: Open Your App

```bash
# Open the app in your browser
heroku open
```

## Troubleshooting

### If deployment fails:
```bash
# Check logs
heroku logs --tail

# Check build logs
heroku logs --tail --dyno web
```

### If database connection fails:
```bash
# Check environment variables
heroku config

# Reset database
heroku run npx prisma db push --force-reset
```

## Environment Variables Needed:
- `DATABASE_URL` (automatically set by PostgreSQL addon)
- `NEXTAUTH_URL` (your Heroku app URL)
- `NEXTAUTH_SECRET` (generate a random string)
- `NEXT_PUBLIC_SOCKET_IO_URL` (your Heroku app URL)

## Free Tier Limits:
- 550-1000 dyno hours per month
- Sleeps after 30 minutes of inactivity
- 10,000 rows in PostgreSQL database
- No custom domains on free tier

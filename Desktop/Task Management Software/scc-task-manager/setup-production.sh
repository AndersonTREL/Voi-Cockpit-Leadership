#!/bin/bash

# SCC Task Manager - Production Setup Script
# This script helps set up the application for production deployment

echo "🚀 SCC Task Manager - Production Setup"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local file not found. Creating from example..."
    cp env.example .env.local
    echo "📝 Please update .env.local with your production values:"
    echo "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
    echo "   - NEXTAUTH_URL (your production URL)"
    echo "   - DATABASE_URL (your production database URL)"
    echo "   - Email configuration"
    echo ""
    echo "After updating .env.local, run:"
    echo "   npm run db:push"
    echo "   npm run db:seed"
else
    echo "✅ .env.local file found"
fi

# Check if database exists
if [ -f "prisma/dev.db" ]; then
    echo "✅ Development database found"
else
    echo "⚠️  No database found. You'll need to:"
    echo "   1. Update DATABASE_URL in .env.local"
    echo "   2. Run: npm run db:push"
    echo "   3. Run: npm run db:seed"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo "1. Update .env.local with production values"
echo "2. Push your code to GitHub"
echo "3. Deploy to your chosen platform (Vercel, Railway, etc.)"
echo "4. Configure environment variables in your deployment platform"
echo "5. Share the URL with your team"
echo ""
echo "📚 For detailed deployment instructions, see DEPLOYMENT.md"

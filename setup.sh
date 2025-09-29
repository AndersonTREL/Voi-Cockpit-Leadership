#!/bin/bash

echo "🚀 Setting up SCC Task Manager..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Check if database URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL is not set. Please update your .env file with your database URL."
    echo "   Example: DATABASE_URL=\"postgresql://username:password@localhost:5432/scc_task_manager?schema=public\""
    echo ""
    echo "   After setting up your database URL, run:"
    echo "   npm run db:push"
    echo "   npm run db:seed"
else
    # Push schema to database
    echo "🗄️  Pushing schema to database..."
    npm run db:push

    # Seed database
    echo "🌱 Seeding database..."
    npm run db:seed
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
echo "Demo accounts:"
echo "  Anderson Meta: anderson@example.com"
echo "  Boris Toma: boris@example.com"
echo "  Vladimir Medic: vladimir@example.com"
echo "  Password: password123"

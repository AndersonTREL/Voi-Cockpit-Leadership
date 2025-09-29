import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    await prisma.$connect()
    
    // Check if tables exist by trying to count users
    const userCount = await prisma.user.count()
    
    return NextResponse.json({
      success: true,
      message: "Database is accessible and tables exist",
      userCount,
      tablesExist: true
    })
    
  } catch (error) {
    console.error("Database check error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      tablesExist: false,
      suggestion: "Tables might not exist. Need to run database migrations."
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST() {
  try {
    console.log("Starting database setup...")
    
    // Test connection first
    await prisma.$connect()
    console.log("Database connected successfully")
    
    try {
      // Import execSync dynamically to avoid require() issues
      const { execSync } = await import('child_process')
      
      // Run prisma db push to create tables
      execSync('npx prisma db push --force-reset', { 
        stdio: 'pipe',
        cwd: process.cwd(),
        env: {
          ...process.env,
          DATABASE_URL: process.env.DATABASE_URL
        }
      })
      
      console.log("Schema pushed successfully")
      
      // Seed the database
      execSync('npx prisma db seed', { 
        stdio: 'pipe',
        cwd: process.cwd(),
        env: {
          ...process.env,
          DATABASE_URL: process.env.DATABASE_URL
        }
      })
      
      console.log("Database seeded successfully")
      
      // Test by counting users
      const userCount = await prisma.user.count()
      
      return NextResponse.json({
        success: true,
        message: "Database setup completed successfully",
        userCount,
        tablesCreated: true
      })
      
    } catch (pushError) {
      console.error("Prisma push error:", pushError)
      return NextResponse.json({
        success: false,
        error: "Failed to create tables",
        details: pushError instanceof Error ? pushError.message : "Unknown error"
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error("Database setup error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: error
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
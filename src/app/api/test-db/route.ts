import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Try to count users
    let userCount = await prisma.user.count()
    
    // Delete all users except andersonmeta1996@gmail.com
    const allUsers = await prisma.user.findMany()
    
    for (const user of allUsers) {
      if (user.email !== 'andersonmeta1996@gmail.com') {
        await prisma.user.delete({
          where: { id: user.id }
        })
        console.log(`✅ Deleted user: ${user.email}`)
      }
    }
    
    // Set andersonmeta1996@gmail.com as ADMIN
    const andersonUser = await prisma.user.findUnique({
      where: { email: 'andersonmeta1996@gmail.com' }
    })
    
    if (andersonUser) {
      await prisma.user.update({
        where: { id: andersonUser.id },
        data: { 
          role: 'ADMIN',
          isActive: true,
          emailVerified: new Date()
        }
      })
      console.log('✅ Set andersonmeta1996@gmail.com as ADMIN')
    } else {
      // Create admin user if it doesn't exist
      const hashedPassword = await bcrypt.hash("password123", 10)
      await prisma.user.create({
        data: {
          email: 'andersonmeta1996@gmail.com',
          name: 'Anderson Meta',
          password: hashedPassword,
          emailVerified: new Date(),
          role: 'ADMIN',
          isActive: true,
        }
      })
      console.log('✅ Created andersonmeta1996@gmail.com as ADMIN')
    }
    
    // If no users exist, create admin user
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash("password123", 10)
      
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          name: 'Admin User',
          password: hashedPassword,
          emailVerified: new Date(),
          role: 'ADMIN',
          isActive: true,
        },
      })
      
      // Create sample tasks
      const tasks = [
        {
          title: 'Setup project infrastructure',
          description: 'Configure development environment and CI/CD pipeline',
          area: 'Development',
          ownerId: adminUser.id,
          ownerDisplayName: 'Admin User',
          priority: 'HIGH',
          status: 'TODO',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Design user interface',
          description: 'Create wireframes and mockups for the application',
          area: 'Design',
          ownerId: adminUser.id,
          ownerDisplayName: 'Admin User',
          priority: 'MEDIUM',
          status: 'IN_PROGRESS',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Implement authentication',
          description: 'Set up user authentication and authorization system',
          area: 'Backend',
          ownerId: adminUser.id,
          ownerDisplayName: 'Admin User',
          priority: 'HIGH',
          status: 'DONE',
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ]

      for (const taskData of tasks) {
        await prisma.task.create({
          data: {
            ...taskData,
            priority: taskData.priority as any,
            status: taskData.status as any,
          },
        })
      }
      
      userCount = await prisma.user.count()
      
      return NextResponse.json({
        success: true,
        message: "Database connection successful and admin user created",
        userCount,
        databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set",
        adminCreated: true,
        adminEmail: "admin@example.com"
      })
    }
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      userCount,
      databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set"
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set"
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

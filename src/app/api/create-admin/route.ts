import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST() {
  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash("password123", 10)
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
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

    const createdTasks = []
    for (const taskData of tasks) {
      const task = await prisma.task.create({
        data: {
          ...taskData,
          priority: taskData.priority as any,
          status: taskData.status as any,
        },
      })
      createdTasks.push(task)
    }

    return NextResponse.json({
      success: true,
      message: "Admin user and sample data created successfully",
      adminUser: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
      },
      tasksCreated: createdTasks.length
    })
    
  } catch (error) {
    console.error("Create admin error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

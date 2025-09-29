import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Priority, Status, Risk } from "@/types/task"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tasks = await prisma.task.findMany({
      include: {
        owner: true,
        subtasks: true,
        dependencies: {
          include: {
            dependent: true,
          },
        },
        dependents: {
          include: {
            task: true,
          },
        },
        comments: {
          include: {
            user: true,
          },
        },
        attachments: true,
        activities: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== TASK CREATION API CALLED ===")
    
    const session = await getServerSession(authOptions)
    if (!session) {
      console.error("No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    console.log("Session user:", session.user?.email)

    const body = await request.json()
    const {
      title,
      description,
      area,
      subArea,
      endProduct,
      owner,
      priority,
      status,
      acceptanceCriteria,
      dueDate,
      startDate,
      effort,
      risk,
    } = body

    // Validate that the owner is a valid user ID
    console.log("Owner selection:", owner)
    
    if (!owner) {
      console.error("No owner provided")
      return NextResponse.json({ error: "Owner is required" }, { status: 400 })
    }
    
    const selectedUser = await prisma.user.findUnique({ where: { id: owner } })
    if (!selectedUser) {
      console.error("Invalid owner ID:", owner)
      return NextResponse.json({ error: "Invalid owner selected" }, { status: 400 })
    }
    
    console.log("Selected user:", selectedUser.name, "with ID:", owner)

    // Validate required fields
    if (!title || !area) {
      console.error("Missing required fields:", { title, area })
      return NextResponse.json({ error: "Title and Area are required" }, { status: 400 })
    }

    console.log("Creating task with data:", {
      title,
      area,
      ownerId: owner,
      ownerDisplayName: selectedUser.name,
      priority: priority || Priority.MEDIUM,
      status: status || Status.TODO
    })

    const task = await prisma.task.create({
      data: {
        title,
        description,
        area,
        subArea,
        endProduct,
        ownerId: owner,
        priority: priority || Priority.MEDIUM,
        status: status || Status.TODO,
        acceptanceCriteria,
        dueDate: dueDate ? new Date(dueDate) : null,
        startDate: startDate ? new Date(startDate) : null,
        effort: effort ? parseInt(effort) : null,
        risk: risk || null,
      },
      include: {
        owner: true,
      },
    })

    // Create activity log entry
    await prisma.activity.create({
      data: {
        type: "created",
        message: `Task "${title}" was created`,
        taskId: task.id,
        userId: (session.user as any)?.id || "",
      },
    })

    console.log("Task created successfully with ownerId:", owner, "and ownerDisplayName:", selectedUser.name)
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    console.error("Error details:", {
      message: (error as any)?.message,
      code: (error as any)?.code,
      meta: (error as any)?.meta
    })
    
    // Return more specific error information
    const errorMessage = (error as any)?.message || "Internal server error"
    const errorCode = (error as any)?.code || "UNKNOWN_ERROR"
    
    return NextResponse.json({ 
      error: errorMessage,
      code: errorCode,
      details: (error as any)?.meta || null
    }, { status: 500 })
  }
}


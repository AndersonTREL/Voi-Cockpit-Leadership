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
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      area,
      subArea,
      endProduct,
      priority,
      status,
      acceptanceCriteria,
      dueDate,
      startDate,
      effort,
      risk,
    } = body

    const task = await prisma.task.create({
      data: {
        title,
        description,
        area,
        subArea,
        endProduct,
        ownerId: session.user.id,
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
        userId: session.user.id,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

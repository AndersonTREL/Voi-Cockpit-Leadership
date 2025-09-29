import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Priority, Status, Risk } from "@/types/task"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const task = await prisma.task.findUnique({
      where: { id },
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
          orderBy: {
            createdAt: "desc",
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
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      owner,
      priority,
      status,
      acceptanceCriteria,
      dueDate,
      startDate,
      effort,
      risk,
    } = body

    const { id } = await params
    // Get the current task to compare changes
    const currentTask = await prisma.task.findUnique({
      where: { id },
    })

    if (!currentTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Only validate owner if it's being changed
    let ownerId = currentTask.ownerId // Keep current owner by default
    
    if (owner && owner !== currentTask.ownerId) {
      console.log("Owner selection (update):", owner)
      
      const selectedUser = await prisma.user.findUnique({ where: { id: owner } })
      if (!selectedUser) {
        console.error("Invalid owner ID:", owner)
        return NextResponse.json({ error: "Invalid owner selected" }, { status: 400 })
      }
      
      console.log("Selected user (update):", selectedUser.name, "with ID:", owner)
      ownerId = owner
    }

    // Build update data object with only provided fields
    const updateData: any = {}
    
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (area !== undefined) updateData.area = area
    if (subArea !== undefined) updateData.subArea = subArea
    if (endProduct !== undefined) updateData.endProduct = endProduct
    if (ownerId !== currentTask.ownerId) updateData.ownerId = ownerId
    if (priority !== undefined) updateData.priority = priority
    if (status !== undefined) updateData.status = status
    if (acceptanceCriteria !== undefined) updateData.acceptanceCriteria = acceptanceCriteria
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null
    if (effort !== undefined) updateData.effort = effort ? parseInt(effort) : null
    if (risk !== undefined) updateData.risk = risk

    console.log("Updating task with data:", updateData)

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        owner: true,
      },
    })

    // Create activity log entry for changes
    const changes = []
    if (currentTask.title !== title) changes.push(`title changed to "${title}"`)
    if (currentTask.status !== status) changes.push(`status changed to "${status}"`)
    if (currentTask.priority !== priority) changes.push(`priority changed to "${priority}"`)
    if (currentTask.ownerId !== ownerId) changes.push(`owner changed`)
    
    if (changes.length > 0) {
      await prisma.activity.create({
        data: {
          type: "updated",
          message: `Task "${title}" was updated: ${changes.join(", ")}`,
          taskId: task.id,
          userId: (session.user as any)?.id || "",
        },
      })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const task = await prisma.task.findUnique({
      where: { id },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    await prisma.task.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

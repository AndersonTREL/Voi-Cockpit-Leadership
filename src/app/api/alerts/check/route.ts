import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Check for tasks approaching deadlines
    await checkDeadlineAlerts()
    
    // Check for overdue tasks
    await checkOverdueTasks()
    
    return NextResponse.json({ success: true, message: 'Alerts checked successfully' })
  } catch (error) {
    console.error('Alert check error:', error)
    return NextResponse.json({ error: 'Failed to check alerts' }, { status: 500 })
  }
}

async function checkDeadlineAlerts() {
  // Get all users with deadline alerts enabled
  const usersWithDeadlineAlerts = await prisma.user.findMany({
    include: {
      alerts: {
        where: {
          type: 'deadline',
          isEnabled: true
        }
      },
      tasks: {
        where: {
          dueDate: {
            not: null
          },
          status: {
            not: 'DONE'
          }
        }
      }
    }
  })

  for (const user of usersWithDeadlineAlerts) {
    if (user.alerts.length === 0) continue

    const alert = user.alerts[0] // Assuming one deadline alert per user
    const advanceDays = alert.advanceDays || 1
    
    // Calculate the alert date
    const alertDate = new Date()
    alertDate.setDate(alertDate.getDate() + advanceDays)
    alertDate.setHours(0, 0, 0, 0)

    // Find tasks due on the alert date
    const tasksDueSoon = user.tasks.filter(task => {
      if (!task.dueDate) return false
      const taskDueDate = new Date(task.dueDate)
      taskDueDate.setHours(0, 0, 0, 0)
      return taskDueDate.getTime() === alertDate.getTime()
    })

    // Create notifications for tasks due soon
    for (const task of tasksDueSoon) {
      // Check if notification already exists
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: user.id,
          taskId: task.id,
          type: 'deadline_alert',
          isRead: false
        }
      })

      if (!existingNotification) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            taskId: task.id,
            type: 'deadline_alert',
            title: 'Task Deadline Approaching',
            message: `Task "${task.title}" is due ${advanceDays === 1 ? 'tomorrow' : `in ${advanceDays} days`}`,
            isRead: false,
            isSent: false
          }
        })
      }
    }
  }
}

async function checkOverdueTasks() {
  const today = new Date()
  today.setHours(23, 59, 59, 999) // End of today

  // Get all overdue tasks
  const overdueTasks = await prisma.task.findMany({
    where: {
      dueDate: {
        lt: today
      },
      status: {
        not: 'DONE'
      }
    },
    include: {
      owner: true
    }
  })

  // Create notifications for overdue tasks
  for (const task of overdueTasks) {
    // Check if notification already exists
    const existingNotification = await prisma.notification.findFirst({
      where: {
        userId: task.ownerId,
        taskId: task.id,
        type: 'overdue_task',
        isRead: false
      }
    })

    if (!existingNotification) {
      const daysOverdue = Math.ceil((today.getTime() - new Date(task.dueDate!).getTime()) / (1000 * 60 * 60 * 24))
      
      await prisma.notification.create({
        data: {
          userId: task.ownerId,
          taskId: task.id,
          type: 'overdue_task',
          title: 'Task Overdue',
          message: `Task "${task.title}" is ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue`,
          isRead: false,
          isSent: false
        }
      })
    }
  }
}

// Allow GET requests for manual testing
export async function GET() {
  try {
    await checkDeadlineAlerts()
    await checkOverdueTasks()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Alerts checked successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Alert check error:', error)
    return NextResponse.json({ error: 'Failed to check alerts' }, { status: 500 })
  }
}

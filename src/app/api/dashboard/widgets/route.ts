import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's dashboard configuration
    const dashboardConfig = await prisma.dashboardWidget.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        position: 'asc'
      }
    })

    // If no configuration exists, create default widgets
    if (dashboardConfig.length === 0) {
      const defaultWidgets = [
        {
          userId: user.id,
          widgetType: 'task_stats',
          position: 1,
          isEnabled: true,
          config: JSON.stringify({
            title: 'Task Statistics',
            showChart: true,
            chartType: 'bar'
          })
        },
        {
          userId: user.id,
          widgetType: 'recent_tasks',
          position: 2,
          isEnabled: true,
          config: JSON.stringify({
            title: 'Recent Tasks',
            limit: 5,
            showStatus: true
          })
        },
        {
          userId: user.id,
          widgetType: 'priority_breakdown',
          position: 3,
          isEnabled: true,
          config: JSON.stringify({
            title: 'Priority Breakdown',
            chartType: 'pie'
          })
        },
        {
          userId: user.id,
          widgetType: 'upcoming_deadlines',
          position: 4,
          isEnabled: true,
          config: JSON.stringify({
            title: 'Upcoming Deadlines',
            daysAhead: 7,
            limit: 5
          })
        }
      ]

      await prisma.dashboardWidget.createMany({
        data: defaultWidgets
      })

      // Fetch the created widgets
      const createdWidgets = await prisma.dashboardWidget.findMany({
        where: {
          userId: user.id
        },
        orderBy: {
          position: 'asc'
        }
      })

      return NextResponse.json({ widgets: createdWidgets })
    }

    return NextResponse.json({ widgets: dashboardConfig })
  } catch (error) {
    console.error('Get dashboard widgets error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard widgets' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { widgets } = await request.json()

    if (!Array.isArray(widgets)) {
      return NextResponse.json({ error: 'Invalid widgets data' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete existing widgets
    await prisma.dashboardWidget.deleteMany({
      where: {
        userId: user.id
      }
    })

    // Create new widgets
    const widgetsToCreate = widgets.map((widget: any, index: number) => ({
      userId: user.id,
      widgetType: widget.type,
      position: index + 1,
      isEnabled: widget.enabled !== false,
      config: JSON.stringify(widget.config || {})
    }))

    await prisma.dashboardWidget.createMany({
      data: widgetsToCreate
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Save dashboard widgets error:', error)
    return NextResponse.json({ error: 'Failed to save dashboard widgets' }, { status: 500 })
  }
}

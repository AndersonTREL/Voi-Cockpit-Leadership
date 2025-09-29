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

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    const whereClause: any = {
      user: {
        email: session.user.email
      }
    }

    if (unreadOnly) {
      whereClause.isRead = false
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            dueDate: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        user: {
          email: session.user.email
        },
        isRead: false
      }
    })

    return NextResponse.json({
      notifications,
      unreadCount,
      total: notifications.length
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notificationIds, action } = await request.json()

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({ error: 'Invalid notification IDs' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    switch (action) {
      case 'markRead':
        await prisma.notification.updateMany({
          where: {
            id: {
              in: notificationIds
            },
            userId: user.id
          },
          data: {
            isRead: true
          }
        })
        break

      case 'markUnread':
        await prisma.notification.updateMany({
          where: {
            id: {
              in: notificationIds
            },
            userId: user.id
          },
          data: {
            isRead: false
          }
        })
        break

      case 'delete':
        await prisma.notification.deleteMany({
          where: {
            id: {
              in: notificationIds
            },
            userId: user.id
          }
        })
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update notifications error:', error)
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
  }
}

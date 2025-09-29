import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { query, filters } = await request.json()

    const whereClause: any = {
      owner: {
        email: session.user.email
      }
    }

    // Text search across multiple fields
    if (query && query.trim()) {
      const searchQuery = query.trim()
      whereClause.OR = [
        {
          title: {
            contains: searchQuery,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: searchQuery,
            mode: 'insensitive'
          }
        },
        {
          area: {
            contains: searchQuery,
            mode: 'insensitive'
          }
        },
        {
          subArea: {
            contains: searchQuery,
            mode: 'insensitive'
          }
        },
        {
          ownerDisplayName: {
            contains: searchQuery,
            mode: 'insensitive'
          }
        }
      ]
    }

    // Apply filters
    if (filters) {
      if (filters.status) {
        whereClause.status = filters.status
      }
      
      if (filters.priority) {
        whereClause.priority = filters.priority
      }
      
      if (filters.area) {
        whereClause.area = {
          contains: filters.area,
          mode: 'insensitive'
        }
      }
      
      if (filters.owner) {
        whereClause.ownerDisplayName = {
          contains: filters.owner,
          mode: 'insensitive'
        }
      }
      
      if (filters.dateFrom || filters.dateTo) {
        whereClause.createdAt = {}
        if (filters.dateFrom) {
          whereClause.createdAt.gte = new Date(filters.dateFrom)
        }
        if (filters.dateTo) {
          whereClause.createdAt.lte = new Date(filters.dateTo)
        }
      }
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            name: true,
            email: true
          }
        },
        subtasks: true,
        comments: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        activities: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 5,
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      tasks,
      total: tasks.length,
      query: query || '',
      filters: filters || {}
    })
  } catch (error) {
    console.error('Task search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query.trim()) {
      return NextResponse.json({ tasks: [], total: 0, query: '' })
    }

    const whereClause: any = {
      owner: {
        email: session.user.email
      },
      OR: [
        {
          title: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          area: {
            contains: query,
            mode: 'insensitive'
          }
        }
      ]
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        area: true,
        dueDate: true,
        ownerDisplayName: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return NextResponse.json({
      tasks,
      total: tasks.length,
      query
    })
  } catch (error) {
    console.error('Quick search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

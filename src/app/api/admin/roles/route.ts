import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManageRoles } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !canManageRoles(session.user as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(roles)
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !canManageRoles(session.user as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Role name is required' }, { status: 400 })
    }

    // Check if role already exists
    const existingRole = await prisma.role.findUnique({
      where: { name }
    })

    if (existingRole) {
      return NextResponse.json({ error: 'Role with this name already exists' }, { status: 409 })
    }

    const role = await prisma.role.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        isSystem: false
      }
    })

    return NextResponse.json({ message: 'Role created successfully', role }, { status: 201 })
  } catch (error) {
    console.error('Error creating role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

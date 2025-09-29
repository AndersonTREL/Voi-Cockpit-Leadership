import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManageUsers } from '@/lib/permissions'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !canManageUsers(session.user as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, roleId } = await request.json()

    if (!userId || !roleId) {
      return NextResponse.json({ error: 'User ID and role ID are required' }, { status: 400 })
    }

    // Update user's primary role
    await prisma.user.update({
      where: { id: userId },
      data: { role: roleId as any }
    })

    // Find the role record
    const role = await prisma.role.findFirst({
      where: { name: roleId }
    })

    if (role) {
      // Remove existing role assignments
      await prisma.userRoleAssignment.deleteMany({
        where: { userId }
      })

      // Add new role assignment
      await prisma.userRoleAssignment.create({
        data: {
          userId,
          roleId: role.id,
          assignedBy: session.user.id
        }
      })
    }

    return NextResponse.json({ message: 'User role updated successfully' })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

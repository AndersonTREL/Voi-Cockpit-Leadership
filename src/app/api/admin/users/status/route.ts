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

    const { userId, isActive } = await request.json()

    if (!userId || typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'User ID and isActive status are required' }, { status: 400 })
    }

    // Prevent admin from deactivating themselves
    if (userId === session.user.id && !isActive) {
      return NextResponse.json({ error: 'Cannot deactivate your own account' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive }
    })

    return NextResponse.json({ message: `User ${isActive ? 'activated' : 'deactivated'} successfully` })
  } catch (error) {
    console.error('Error updating user status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

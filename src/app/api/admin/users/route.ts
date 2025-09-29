import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateVerificationToken } from '@/lib/auth-utils'
import { sendVerificationEmail } from '@/lib/email'
import { canAccessAdmin, canManageUsers } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !canAccessAdmin(session.user as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !canManageUsers(session.user as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, email, password, role = 'USER' } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)
    
    // Generate verification token
    const verificationToken = generateVerificationToken()

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role as any,
        verificationToken,
        emailVerified: null, // Don't auto-verify, let them verify via email
        isActive: true
      }
    })

    // Assign role if not default USER
    if (role !== 'USER') {
      const roleRecord = await prisma.role.findFirst({
        where: { name: role }
      })

      if (roleRecord) {
        await prisma.userRoleAssignment.create({
          data: {
            userId: user.id,
            roleId: roleRecord.id,
            assignedBy: session.user.id
          }
        })
      }
    }

    // Send verification email
    try {
      const emailResult = await sendVerificationEmail(user.email, verificationToken, user.name || undefined)
      if (!emailResult.success) {
        console.error('Failed to send verification email:', emailResult.error)
        // Don't fail the user creation if email fails
      } else {
        console.log('Verification email sent successfully to:', user.email)
      }
    } catch (emailError) {
      console.error('Error during email sending:', emailError)
      // Don't fail the user creation if email fails
    }

    return NextResponse.json({ 
      message: 'User created successfully. Verification email sent.', 
      user 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !canManageUsers(session.user as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Prevent admin from deleting themselves
    if (userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tasks: true,
        activities: true,
        comments: true,
        userRoles: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete user and all related data
    await prisma.$transaction(async (tx) => {
      // Delete user role assignments
      await tx.userRoleAssignment.deleteMany({
        where: { userId }
      })

      // Delete user comments
      await tx.comment.deleteMany({
        where: { userId }
      })

      // Delete user activities
      await tx.activity.deleteMany({
        where: { userId }
      })

      // Delete user tasks
      await tx.task.deleteMany({
        where: { ownerId: userId }
      })

      // Delete user sessions
      await tx.session.deleteMany({
        where: { userId }
      })

      // Delete user accounts
      await tx.account.deleteMany({
        where: { userId }
      })

      // Finally delete the user
      await tx.user.delete({
        where: { id: userId }
      })
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

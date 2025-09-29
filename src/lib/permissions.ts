import { UserRole } from '@/generated/prisma'

export interface UserWithRoles {
  id: string
  name: string | null
  email: string
  role: UserRole
  isActive: boolean
  userRoles: Array<{
    role: {
      id: string
      name: string
      description: string | null
      permissions: Array<{
        permission: {
          name: string
          resource: string
          action: string
        }
      }>
    }
  }>
}

export function hasPermission(user: UserWithRoles, resource: string, action: string): boolean {
  // Admin has all permissions
  if (user.role === 'ADMIN') {
    return true
  }

  // Check if user has the specific permission through their roles
  return user.userRoles.some(userRole =>
    userRole.role.permissions.some(rolePermission =>
      rolePermission.permission.resource === resource &&
      rolePermission.permission.action === action
    )
  )
}

export function hasAnyPermission(user: UserWithRoles, permissions: Array<{ resource: string; action: string }>): boolean {
  return permissions.some(permission => hasPermission(user, permission.resource, permission.action))
}

export function isAdmin(user: UserWithRoles): boolean {
  return user.role === 'ADMIN'
}

export function isManager(user: UserWithRoles): boolean {
  return user.role === 'MANAGER' || user.role === 'ADMIN'
}

export function canManageUsers(user: UserWithRoles): boolean {
  return hasPermission(user, 'admin', 'manage_users') || isAdmin(user)
}

export function canManageRoles(user: UserWithRoles): boolean {
  return hasPermission(user, 'admin', 'manage_roles') || isAdmin(user)
}

export function canAccessAdmin(user: UserWithRoles): boolean {
  return hasPermission(user, 'admin', 'access') || isAdmin(user)
}

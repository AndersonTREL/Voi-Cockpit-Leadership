"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Shield, User, Crown, Calendar, Mail, CheckCircle, XCircle } from "lucide-react"

interface User {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
  emailVerified: boolean
  createdAt: string
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/roles')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      } else {
        toast.error('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Error fetching users')
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      })

      if (response.ok) {
        toast.success('User role updated successfully')
        fetchUsers() // Refresh the list
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update user role')
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('Error updating user role')
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Crown className="h-4 w-4 text-red-600" />
      case 'MANAGER':
        return <Shield className="h-4 w-4 text-blue-600" />
      case 'USER':
        return <User className="h-4 w-4 text-green-600" />
      default:
        return <User className="h-4 w-4 text-gray-600" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'USER':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage user roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          User Management
        </CardTitle>
        <CardDescription>
          Manage user roles and permissions. You can assign MANAGER or USER roles to registered users.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Crown className="h-4 w-4 text-red-600" />
            <span>Admin - Full system access</span>
            <Shield className="h-4 w-4 text-blue-600 ml-4" />
            <span>Manager - Elevated privileges</span>
            <User className="h-4 w-4 text-green-600 ml-4" />
            <span>User - Standard access</span>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold">User</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Joined</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50/30">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <Badge className={`${getRoleBadgeColor(user.role)} text-xs`}>
                          {user.role}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.emailVerified ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-green-700 text-sm">Verified</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-red-700 text-sm">Pending</span>
                          </>
                        )}
                        <div className="ml-2">
                          {user.isActive ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(user.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(newRole) => updateUserRole(user.id, newRole)}
                        disabled={user.role === 'ADMIN'} // Prevent changing admin role
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN" disabled>
                            <div className="flex items-center gap-2">
                              <Crown className="h-4 w-4 text-red-600" />
                              Admin
                            </div>
                          </SelectItem>
                          <SelectItem value="MANAGER">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-blue-600" />
                              Manager
                            </div>
                          </SelectItem>
                          <SelectItem value="USER">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-green-600" />
                              User
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found. Users will appear here once they register.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

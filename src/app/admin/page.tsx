"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { 
  Users, 
  Shield, 
  Settings, 
  UserPlus, 
  UserMinus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Plus,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowLeft
} from "lucide-react"
import { canAccessAdmin, canManageUsers, canManageRoles } from "@/lib/permissions"

interface User {
  id: string
  name: string | null
  email: string
  role: string
  isActive: boolean
  createdAt: string
  userRoles: Array<{
    role: {
      id: string
      name: string
      description: string | null
    }
  }>
}

interface Role {
  id: string
  name: string
  description: string | null
  isSystem: boolean
  permissions: Array<{
    permission: {
      id: string
      name: string
      resource: string
      action: string
    }
  }>
}

interface Permission {
  id: string
  name: string
  description: string | null
  resource: string
  action: string
}

export default function AdminPanel() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editingRole, setEditingRole] = useState<string | null>(null)
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' })
  const [newRole, setNewRole] = useState({ name: '', description: '' })
  const [deleteConfirm, setDeleteConfirm] = useState<{ userId: string; userName: string } | null>(null)
  const [editRoleDialog, setEditRoleDialog] = useState<{ isOpen: boolean; role: Role | null }>({ isOpen: false, role: null })
  const [editablePermissions, setEditablePermissions] = useState<string[]>([])
  const [editableRoleData, setEditableRoleData] = useState({ name: '', description: '' })

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    // Check if user has admin access
    if (!canAccessAdmin(session.user as any)) {
      router.push('/')
      toast.error('Access denied. Admin privileges required.')
      return
    }

    fetchData()
  }, [session, status, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [usersRes, rolesRes, permissionsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/roles'),
        fetch('/api/admin/permissions')
      ])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
      }

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json()
        setRoles(rolesData)
      }

      if (permissionsRes.ok) {
        const permissionsData = await permissionsRes.json()
        setPermissions(permissionsData)
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleUserRoleChange = async (userId: string, roleId: string) => {
    try {
      const response = await fetch('/api/admin/users/role', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roleId })
      })

      if (response.ok) {
        toast.success('User role updated successfully')
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to update user role')
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('Failed to update user role')
    }
  }

  const handleUserStatusToggle = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/users/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isActive })
      })

      if (response.ok) {
        toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`)
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to update user status')
      }
    } catch (error) {
      console.error('Error updating user status:', error)
      toast.error('Failed to update user status')
    }
  }

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })

      if (response.ok) {
        toast.success('User created successfully')
        setNewUser({ name: '', email: '', password: '' })
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to create user')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error('Failed to create user')
    }
  }

  const handleCreateRole = async () => {
    if (!newRole.name) {
      toast.error('Please enter a role name')
      return
    }

    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRole)
      })

      if (response.ok) {
        toast.success('Role created successfully')
        setNewRole({ name: '', description: '' })
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to create role')
      }
    } catch (error) {
      console.error('Error creating role:', error)
      toast.error('Failed to create role')
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteConfirm) return

    try {
      const response = await fetch(`/api/admin/users?userId=${deleteConfirm.userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('User deleted successfully')
        setDeleteConfirm(null)
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    }
  }

  const handleEditRole = (role: Role) => {
    // Initialize editable permissions with current role permissions
    const currentPermissions = role.permissions.map(rp => rp.permission.id)
    setEditablePermissions(currentPermissions)
    // Initialize editable role data
    setEditableRoleData({ name: role.name, description: role.description || '' })
    setEditRoleDialog({ isOpen: true, role })
  }

  const handlePermissionToggle = (permissionId: string) => {
    setEditablePermissions(prev => 
      prev.includes(permissionId) 
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">
                Admin Panel
              </h1>
              <p className="text-white/80 mt-2 text-lg">Manage users, roles, and permissions</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200 ease-out hover:shadow-lg rounded-full px-4 py-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-3 bg-white/10 backdrop-blur-sm p-1 rounded-full shadow-sm border border-white/20 w-fit h-auto">
              <TabsTrigger 
                value="users" 
                className="data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 ease-out hover:bg-white/20 hover:text-white rounded-full font-medium text-sm text-white/80 py-2 px-4 inline-flex items-center justify-center min-h-[36px] h-auto"
              >
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger 
                value="roles" 
                className="data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 ease-out hover:bg-white/20 hover:text-white rounded-full font-medium text-sm text-white/80 py-2 px-4 inline-flex items-center justify-center min-h-[36px] h-auto"
              >
                <Shield className="h-4 w-4 mr-2" />
                Roles & Permissions
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 ease-out hover:bg-white/20 hover:text-white rounded-full font-medium text-sm text-white/80 py-2 px-4 inline-flex items-center justify-center min-h-[36px] h-auto"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <UserPlus className="h-5 w-5 text-teal-600" />
                  Create New User
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Add a new user to the system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="userName">Name</Label>
                    <Input
                      id="userName"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="Enter name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="userEmail">Email</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="userPassword">Password</Label>
                    <Input
                      id="userPassword"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Enter password"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleCreateUser} 
                  className="w-full md:w-auto bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 ease-out border-0 backdrop-blur-sm"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl rounded-xl">
              <CardHeader>
                <CardTitle className="text-gray-900">All Users</CardTitle>
                <CardDescription className="text-gray-600">
                  Manage user roles and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-200/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="font-medium">{user.name || 'No name'}</h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                          <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className={user.role === 'ADMIN' ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white' : 'bg-gray-100 text-gray-700'}>
                            {user.role}
                          </Badge>
                          <Badge variant={user.isActive ? 'default' : 'destructive'} className={user.isActive ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-red-100 text-red-700'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleUserRoleChange(user.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="MANAGER">Manager</SelectItem>
                            <SelectItem value="USER">User</SelectItem>
                            <SelectItem value="VIEWER">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                        <Switch
                          checked={user.isActive}
                          onCheckedChange={(checked) => handleUserStatusToggle(user.id, checked)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteConfirm({ userId: user.id, userName: user.name || user.email })}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 rounded-full transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Plus className="h-5 w-5 text-teal-600" />
                  Create New Role
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Create a custom role with specific permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="roleName">Role Name</Label>
                    <Input
                      id="roleName"
                      value={newRole.name}
                      onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                      placeholder="Enter role name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="roleDescription">Description</Label>
                    <Input
                      id="roleDescription"
                      value={newRole.description}
                      onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                      placeholder="Enter description"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleCreateRole} 
                    className="w-full md:w-auto bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 ease-out border-0 backdrop-blur-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Role
                  </Button>
                  <Button 
                    onClick={() => {
                      setNewRole({ name: 'Project Manager', description: 'Manage projects and assign tasks' })
                      handleCreateRole()
                    }}
                    variant="outline"
                    className="w-full md:w-auto border-teal-300 text-teal-600 hover:bg-teal-50 rounded-full transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Sample Role
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl rounded-xl">
              <CardHeader>
                <CardTitle className="text-gray-900">Roles & Permissions</CardTitle>
                <CardDescription className="text-gray-600">
                  Manage role permissions and assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {roles.map((role) => (
                    <div key={role.id} className="bg-gray-50/50 border border-gray-200/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium flex items-center gap-2">
                            {role.name}
                            {role.isSystem && (
                              <Badge variant="outline">System</Badge>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600">{role.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-full border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-all duration-200"
                            onClick={() => handleEditRole(role)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          {!role.isSystem && (
                            <Button variant="outline" size="sm" className="rounded-full border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700 transition-all duration-200">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {role.permissions.map((rolePermission) => (
                          <Badge key={rolePermission.permission.id} variant="secondary" className="text-xs bg-teal-100 text-teal-700 border border-teal-200">
                            {rolePermission.permission.resource}.{rolePermission.permission.action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl rounded-xl">
              <CardHeader>
                <CardTitle className="text-gray-900">System Settings</CardTitle>
                <CardDescription className="text-gray-600">
                  Configure system-wide settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-200/50 rounded-xl">
                    <div>
                      <h3 className="font-medium text-gray-900">Email Notifications</h3>
                      <p className="text-sm text-gray-600">Send email notifications for task updates</p>
                    </div>
                    <Switch defaultChecked className="data-[state=checked]:bg-teal-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-200/50 rounded-xl">
                    <div>
                      <h3 className="font-medium text-gray-900">Auto-assign Tasks</h3>
                      <p className="text-sm text-gray-600">Automatically assign tasks to available users</p>
                    </div>
                    <Switch className="data-[state=checked]:bg-teal-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-200/50 rounded-xl">
                    <div>
                      <h3 className="font-medium text-gray-900">Task Expiry Notifications</h3>
                      <p className="text-sm text-gray-600">Send notifications for overdue tasks</p>
                    </div>
                    <Switch defaultChecked className="data-[state=checked]:bg-teal-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-2xl rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to permanently delete <strong>{deleteConfirm.userName}</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This will delete all their tasks, comments, activities, and other data.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                className="rounded-full border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Dialog */}
      {editRoleDialog.isOpen && editRoleDialog.role && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-2xl rounded-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <Edit className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Edit Role: {editRoleDialog.role.name}</h3>
                <p className="text-sm text-gray-500">Modify role permissions and settings</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="editRoleName" className="text-sm font-medium text-gray-700">Role Name</Label>
                <Input
                  id="editRoleName"
                  value={editableRoleData.name}
                  onChange={(e) => setEditableRoleData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={editRoleDialog.role.isSystem}
                  className="mt-1"
                  placeholder="Enter role name"
                />
                {editRoleDialog.role.isSystem && (
                  <p className="text-xs text-gray-500 mt-1">System roles cannot be renamed</p>
                )}
              </div>

              <div>
                <Label htmlFor="editRoleDescription" className="text-sm font-medium text-gray-700">Description</Label>
                <Input
                  id="editRoleDescription"
                  value={editableRoleData.description}
                  onChange={(e) => setEditableRoleData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1"
                  placeholder="Enter role description"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Permissions</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {permissions.map((permission) => {
                    const isAssigned = editablePermissions.includes(permission.id)
                    return (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`perm-${permission.id}`}
                          checked={isAssigned}
                          disabled={editRoleDialog.role!.isSystem}
                          onChange={() => handlePermissionToggle(permission.id)}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 focus:ring-2"
                        />
                        <label 
                          htmlFor={`perm-${permission.id}`} 
                          className={`text-sm ${editRoleDialog.role!.isSystem ? 'text-gray-400' : 'text-gray-700 cursor-pointer'}`}
                        >
                          {permission.resource}.{permission.action}
                        </label>
                      </div>
                    )
                  })}
                </div>
                {editRoleDialog.role.isSystem && (
                  <p className="text-xs text-gray-500 mt-2">System role permissions cannot be modified</p>
                )}
                {!editRoleDialog.role.isSystem && (
                  <p className="text-xs text-gray-500 mt-2">
                    Select permissions for this role. Changes will be saved when you click "Save Changes".
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-8">
              <Button
                variant="outline"
                onClick={() => {
                  setEditRoleDialog({ isOpen: false, role: null })
                  setEditablePermissions([])
                  setEditableRoleData({ name: '', description: '' })
                }}
                className="rounded-full border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Here you would normally send the updated permissions to your API
                  console.log('Updated role data:', editableRoleData)
                  console.log('Updated permissions:', editablePermissions)
                  toast.success('Role updated successfully!')
                  setEditRoleDialog({ isOpen: false, role: null })
                  setEditablePermissions([])
                  setEditableRoleData({ name: '', description: '' })
                  fetchData()
                }}
                disabled={editRoleDialog.role.isSystem}
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border-0"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TaskTable } from "@/components/task-table"
import { TaskDialog } from "@/components/task-dialog"
import { ActivityFeed } from "@/components/activity-feed"
import { ProfileDialog } from "@/components/profile-dialog"
import { ExportDialog } from "@/components/export-dialog"
import { NotificationCenter } from "@/components/notification-center"
import { DashboardWidgetManager } from "@/components/dashboard-widget-manager"
import { TaskSearchFilters } from "@/components/task-search-filters"
import { Plus, LogOut, User, Settings, ChevronDown, Shield } from "lucide-react"
import { toast } from "sonner"

interface DashboardStats {
  totalTasks: number
  inProgressTasks: number
  completedTasks: number
  overdueTasks: number
  priorityBreakdown: {
    HIGH: number
    MEDIUM: number
    LOW: number
  }
  ownerBreakdown: Array<{
    owner: string
    totalTasks: number
    completedTasks: number
  }>
}

export function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("tasks")
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    priorityBreakdown: {
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0
    },
    ownerBreakdown: []
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [refreshTaskTables, setRefreshTaskTables] = useState(0)

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" })
    toast.success("Signed out successfully")
  }

  const handleAdminPanel = () => {
    router.push('/admin')
  }

  const handleResetPassword = () => {
    toast.info("Reset Password feature coming soon!")
  }

  const handleViewProfile = () => {
    setIsProfileDialogOpen(true)
  }

  const handleTaskSaved = () => {
    // Refresh dashboard stats
    fetchDashboardStats()
    // Trigger TaskTable refresh by updating the key
    setRefreshTaskTables(prev => prev + 1)
  }

  const fetchDashboardStats = async () => {
    try {
      setIsLoadingStats(true)
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const tasks = await response.json()
        
        const now = new Date()
        const totalTasks = tasks.length
        const inProgressTasks = tasks.filter((task: any) => task.status === 'IN_PROGRESS').length
        const completedTasks = tasks.filter((task: any) => task.status === 'DONE').length
        const overdueTasks = tasks.filter((task: any) => {
          if (!task.dueDate) return false
          const dueDate = new Date(task.dueDate)
          return dueDate < now && task.status !== 'DONE'
        }).length

        // Priority breakdown
        const priorityBreakdown = {
          HIGH: tasks.filter((task: any) => task.priority === 'HIGH').length,
          MEDIUM: tasks.filter((task: any) => task.priority === 'MEDIUM').length,
          LOW: tasks.filter((task: any) => task.priority === 'LOW').length
        }

        // Owner breakdown
        const ownerMap = new Map()
        tasks.forEach((task: any) => {
          const ownerName = task.owner?.name || 'Unassigned'
          if (!ownerMap.has(ownerName)) {
            ownerMap.set(ownerName, { totalTasks: 0, completedTasks: 0 })
          }
          ownerMap.get(ownerName).totalTasks++
          if (task.status === 'DONE') {
            ownerMap.get(ownerName).completedTasks++
          }
        })
        const ownerBreakdown = Array.from(ownerMap.entries()).map(([owner, stats]) => ({
          owner,
          ...stats
        }))

        setDashboardStats({
          totalTasks,
          inProgressTasks,
          completedTasks,
          overdueTasks,
          priorityBreakdown,
          ownerBreakdown
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchDashboardStats()
    }
  }, [session])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="modern-header">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-white">
                VOI Cockpit - Leadership
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notification Center */}
              <NotificationCenter />
              
              {/* User Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200 ease-out hover:shadow-lg rounded-full px-4 py-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">{session?.user?.name}</span>
                    <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-xl rounded-xl">
                  <DropdownMenuItem onClick={handleViewProfile} className="hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150 py-2 px-3 text-sm">
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  {session?.user && (session.user as any).role === 'ADMIN' && (
                    <DropdownMenuItem onClick={handleAdminPanel} className="hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150 py-2 px-3 text-sm">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleResetPassword} className="hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150 py-2 px-3 text-sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Reset Password
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200/50 my-1" />
                  <DropdownMenuItem onClick={handleSignOut} className="hover:bg-red-50 hover:text-red-700 transition-colors duration-150 py-2 px-3 text-sm">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-4 bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-sm border border-gray-200/50 w-fit h-auto">
              <TabsTrigger 
                value="tasks" 
                className="data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 ease-out hover:bg-teal-50 hover:text-teal-700 rounded-full font-medium text-sm text-gray-600 py-2 px-4 relative inline-flex items-center justify-center min-h-[36px] h-auto"
              >
                Active Tasks
              </TabsTrigger>
              <TabsTrigger 
                value="done" 
                className="data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 ease-out hover:bg-teal-50 hover:text-teal-700 rounded-full font-medium text-sm text-gray-600 py-2 px-4 relative inline-flex items-center justify-center min-h-[36px] h-auto"
              >
                Done Tasks
              </TabsTrigger>
              <TabsTrigger 
                value="dashboard" 
                className="data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 ease-out hover:bg-teal-50 hover:text-teal-700 rounded-full font-medium text-sm text-gray-600 py-2 px-4 relative inline-flex items-center justify-center min-h-[36px] h-auto"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 ease-out hover:bg-teal-50 hover:text-teal-700 rounded-full font-medium text-sm text-gray-600 py-2 px-4 relative inline-flex items-center justify-center min-h-[36px] h-auto"
              >
                Activity
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="tasks" className="space-y-6">
            <div className="modern-card rounded-lg p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Active Tasks</h2>
                  <p className="text-gray-600">Manage your tasks and track progress</p>
                </div>
                <div className="flex items-center gap-3">
                  <ExportDialog onExport={handleTaskSaved} />
                  <Button 
                    onClick={() => setIsTaskDialogOpen(true)} 
                    className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 ease-out border-0 backdrop-blur-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Task
                  </Button>
                </div>
              </div>
              <div className="mt-6">
                <TaskSearchFilters 
                  onFiltersChange={(filters) => {
                    // Handle filter changes - could be used for advanced filtering
                    console.log('Filters changed:', filters)
                  }}
                  onSearch={(query) => {
                    // Handle search - could be used for real-time search
                    console.log('Search query:', query)
                  }}
                  isLoading={false}
                />
                <div className="mt-4">
                  <TaskTable 
                    key={`active-${refreshTaskTables}`}
                    statusFilter="active" 
                    onTaskSaved={handleTaskSaved}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="done" className="space-y-6">
            <div className="modern-card rounded-lg p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Completed Tasks</h2>
                  <p className="text-gray-600">Review and manage completed tasks</p>
                </div>
              </div>
              <div className="mt-6">
                <TaskSearchFilters 
                  onFiltersChange={(filters) => {
                    console.log('Done tasks filters changed:', filters)
                  }}
                  onSearch={(query) => {
                    console.log('Done tasks search query:', query)
                  }}
                  isLoading={false}
                />
                <div className="mt-4">
                  <TaskTable 
                    key={`done-${refreshTaskTables}`}
                    statusFilter="done" 
                    onTaskSaved={handleTaskSaved}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="modern-card rounded-lg p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                  <p className="text-gray-600">Overview of your tasks and progress</p>
                </div>
                <DashboardWidgetManager onWidgetsChange={handleTaskSaved} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingStats ? "..." : dashboardStats.totalTasks}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All tasks in the system
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {isLoadingStats ? "..." : dashboardStats.inProgressTasks}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Currently being worked on
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {isLoadingStats ? "..." : dashboardStats.completedTasks}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Successfully finished
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {isLoadingStats ? "..." : dashboardStats.overdueTasks}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Past due date
                  </p>
                </CardContent>
              </Card>
              </div>
              
              {/* Additional Charts and Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Priority Distribution Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Priority Distribution</CardTitle>
                    <CardDescription>Tasks by priority level</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingStats ? (
                      <div className="text-center py-8">Loading...</div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-sm font-medium">High Priority</span>
                          </div>
                          <span className="text-lg font-bold text-red-600">
                            {dashboardStats.priorityBreakdown.HIGH}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span className="text-sm font-medium">Medium Priority</span>
                          </div>
                          <span className="text-lg font-bold text-yellow-600">
                            {dashboardStats.priorityBreakdown.MEDIUM}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium">Low Priority</span>
                          </div>
                          <span className="text-lg font-bold text-green-600">
                            {dashboardStats.priorityBreakdown.LOW}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Team Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Team Performance</CardTitle>
                    <CardDescription>Tasks and completion by team member</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingStats ? (
                      <div className="text-center py-8">Loading...</div>
                    ) : (
                      <div className="space-y-4">
                        {dashboardStats.ownerBreakdown.map((member, index) => {
                          const completionRate = member.totalTasks > 0 
                            ? Math.round((member.completedTasks / member.totalTasks) * 100)
                            : 0
                          return (
                            <div key={index} className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-sm">{member.owner}</div>
                                <div className="text-xs text-gray-500">
                                  {member.completedTasks}/{member.totalTasks} completed
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold">{completionRate}%</div>
                                <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${completionRate}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Task Status Visual Breakdown */}
              <div className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Task Status Overview</CardTitle>
                    <CardDescription>Visual breakdown of all tasks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingStats ? (
                      <div className="text-center py-8">Loading...</div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Completed</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-green-500 h-3 rounded-full" 
                                style={{ 
                                  width: `${dashboardStats.totalTasks > 0 ? (dashboardStats.completedTasks / dashboardStats.totalTasks) * 100 : 0}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold text-green-600">
                              {dashboardStats.completedTasks}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">In Progress</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-blue-500 h-3 rounded-full" 
                                style={{ 
                                  width: `${dashboardStats.totalTasks > 0 ? (dashboardStats.inProgressTasks / dashboardStats.totalTasks) * 100 : 0}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold text-blue-600">
                              {dashboardStats.inProgressTasks}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Overdue</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-red-500 h-3 rounded-full" 
                                style={{ 
                                  width: `${dashboardStats.totalTasks > 0 ? (dashboardStats.overdueTasks / dashboardStats.totalTasks) * 100 : 0}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold text-red-600">
                              {dashboardStats.overdueTasks}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <div className="modern-card rounded-lg p-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Activity Feed</h2>
                <p className="text-gray-600">Recent activity across all tasks</p>
              </div>
              <div className="mt-6">
                <ActivityFeed />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        onTaskSaved={() => {
          setIsTaskDialogOpen(false)
          handleTaskSaved()
        }}
      />

      <ProfileDialog
        isOpen={isProfileDialogOpen}
        onClose={() => setIsProfileDialogOpen(false)}
        user={{
          name: session?.user?.name || null,
          email: session?.user?.email || null
        }}
      />
    </div>
  )
}
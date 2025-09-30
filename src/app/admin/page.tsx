"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserManagement } from "@/components/user-management"
import { ArrowLeft, Shield, Users, Settings } from "lucide-react"

export default function AdminPanel() {
  const { data: session } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("users")

  // Redirect if not admin
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg-forest">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/')} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg-forest">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.push('/')}
                variant="ghost"
                className="text-white hover:bg-white/20 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-white/20" />
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-white" />
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-white/80">
              <Users className="h-4 w-4" />
              <span className="text-sm">Welcome, {session?.user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">System Administration</h2>
          <p className="text-white/80">
            Manage users, roles, and system settings for VOI Cockpit Leadership.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="bg-white/10 backdrop-blur-md border border-white/20">
              <TabsTrigger 
                value="users" 
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/80"
              >
                <Users className="h-4 w-4 mr-2" />
                User Management
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/80"
              >
                <Settings className="h-4 w-4 mr-2" />
                System Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Settings
                </CardTitle>
                <CardDescription>
                  Configure system-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>System settings panel coming soon...</p>
                    <p className="text-sm">This will include email configuration, security settings, and more.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
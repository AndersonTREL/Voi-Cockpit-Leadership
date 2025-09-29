"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Settings, GripVertical, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

interface Widget {
  id: string
  widgetType: string
  position: number
  isEnabled: boolean
  config: string
}

interface DashboardWidgetManagerProps {
  onWidgetsChange?: (widgets: Widget[]) => void
}

export function DashboardWidgetManager({ onWidgetsChange }: DashboardWidgetManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const fetchWidgets = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/dashboard/widgets')
      if (response.ok) {
        const data = await response.json()
        setWidgets(data.widgets || [])
      }
    } catch (error) {
      console.error('Failed to fetch widgets:', error)
      toast.error('Failed to load dashboard widgets')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchWidgets()
    }
  }, [isOpen])

  const saveWidgets = async () => {
    setIsSaving(true)
    try {
      const widgetsToSave = widgets.map(widget => ({
        type: widget.widgetType,
        enabled: widget.isEnabled,
        config: JSON.parse(widget.config)
      }))

      const response = await fetch('/api/dashboard/widgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          widgets: widgetsToSave
        })
      })

      if (response.ok) {
        toast.success('Dashboard widgets saved successfully!')
        if (onWidgetsChange) {
          onWidgetsChange(widgets)
        }
      } else {
        throw new Error('Failed to save widgets')
      }
    } catch (error) {
      console.error('Failed to save widgets:', error)
      toast.error('Failed to save dashboard widgets')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleWidget = (widgetId: string) => {
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === widgetId 
          ? { ...widget, isEnabled: !widget.isEnabled }
          : widget
      )
    )
  }

  const moveWidget = (fromIndex: number, toIndex: number) => {
    const newWidgets = [...widgets]
    const [movedWidget] = newWidgets.splice(fromIndex, 1)
    newWidgets.splice(toIndex, 0, movedWidget)
    
    // Update positions
    const updatedWidgets = newWidgets.map((widget, index) => ({
      ...widget,
      position: index + 1
    }))
    
    setWidgets(updatedWidgets)
  }

  const getWidgetInfo = (type: string) => {
    const widgetInfo: Record<string, { title: string; description: string }> = {
      task_stats: {
        title: 'Task Statistics',
        description: 'Overview of your task counts and progress'
      },
      recent_tasks: {
        title: 'Recent Tasks',
        description: 'Your latest created and updated tasks'
      },
      priority_breakdown: {
        title: 'Priority Breakdown',
        description: 'Visual breakdown of tasks by priority level'
      },
      upcoming_deadlines: {
        title: 'Upcoming Deadlines',
        description: 'Tasks with approaching due dates'
      }
    }
    return widgetInfo[type] || { title: type, description: 'Custom widget' }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Customize Dashboard
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[700px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Customize Dashboard
          </DialogTitle>
          <DialogDescription>
            Arrange and configure your dashboard widgets to match your workflow.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            </div>
          ) : widgets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No widgets configured</p>
              <p className="text-sm">Default widgets will be created for you.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {widgets.map((widget, index) => {
                const info = getWidgetInfo(widget.widgetType)
                return (
                  <Card key={widget.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="cursor-move">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{info.title}</h4>
                            <p className="text-xs text-gray-500">{info.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {widget.isEnabled ? (
                              <Eye className="h-4 w-4 text-green-500" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            )}
                            <Switch
                              checked={widget.isEnabled}
                              onCheckedChange={() => toggleWidget(widget.id)}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => fetchWidgets()}
            disabled={isLoading}
          >
            Reset to Default
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={saveWidgets}
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

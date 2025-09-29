"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity } from "@/types/task"
import { formatDistanceToNow } from "date-fns"
import { RefreshCw, Clock, User, CheckCircle, Edit, Plus, MessageSquare } from "lucide-react"
import { toast } from "sonner"

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/activities")
      const data = await response.json()
      setActivities(data)
      toast.success("Activity feed refreshed")
    } catch (error) {
      console.error("Failed to fetch activities:", error)
      toast.error("Failed to refresh activities")
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "created":
        return <Plus className="h-4 w-4 text-green-600" />
      case "updated":
        return <Edit className="h-4 w-4 text-blue-600" />
      case "commented":
        return <MessageSquare className="h-4 w-4 text-purple-600" />
      case "status_changed":
        return <CheckCircle className="h-4 w-4 text-orange-600" />
      case "assigned":
        return <User className="h-4 w-4 text-indigo-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "created":
        return "bg-green-50 border-green-200 text-green-800"
      case "updated":
        return "bg-blue-50 border-blue-200 text-blue-800"
      case "commented":
        return "bg-purple-50 border-purple-200 text-purple-800"
      case "status_changed":
        return "bg-orange-50 border-orange-200 text-orange-800"
      case "assigned":
        return "bg-indigo-50 border-indigo-200 text-indigo-800"
      default:
        return "bg-gray-50 border-gray-200 text-gray-800"
    }
  }

  const formatActivityMessage = (message: string) => {
    // Clean up undefined values in the message
    return message
      .replace(/undefined/g, 'N/A')
      .replace(/title changed to "N\/A"/g, 'title updated')
      .replace(/priority changed to "N\/A"/g, 'priority updated')
      .replace(/status changed to "N\/A"/g, 'status updated')
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start space-x-3 p-4 rounded-lg border bg-gray-50">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <p className="text-sm text-gray-500">Latest updates across all tasks</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchActivities}
          disabled={loading}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Clock className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h3>
          <p className="text-gray-500">Activity will appear here as tasks are created and updated.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div 
              key={activity.id} 
              className={`flex items-start space-x-3 p-4 rounded-lg border transition-all hover:shadow-sm ${
                index === 0 ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                activity.type === 'created' ? 'bg-green-100' :
                activity.type === 'updated' ? 'bg-blue-100' :
                activity.type === 'commented' ? 'bg-purple-100' :
                activity.type === 'status_changed' ? 'bg-orange-100' :
                activity.type === 'assigned' ? 'bg-indigo-100' :
                'bg-gray-100'
              }`}>
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs font-medium ${getActivityColor(activity.type)}`}
                  >
                    {activity.type.replace("_", " ").toUpperCase()}
                  </Badge>
                  <span className="text-xs text-gray-500 flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</span>
                  </span>
                </div>
                
                <p className="text-sm text-gray-900 mb-2 leading-relaxed">
                  {formatActivityMessage(activity.message)}
                </p>
                
                {activity.user && (
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <User className="h-3 w-3" />
                    <span>by {activity.user.name}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


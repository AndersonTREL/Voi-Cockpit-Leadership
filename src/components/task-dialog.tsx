"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Task } from "@/types/task"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Priority, Status, Risk } from "@/types/task"
import { toast } from "sonner"

const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  area: z.string().min(1, "Area is required"),
  subArea: z.string().optional(),
  endProduct: z.string().optional(),
  owner: z.string().min(1, "Owner is required"),
  priority: z.nativeEnum(Priority),
  status: z.nativeEnum(Status),
  dueDate: z.string().optional(),
  startDate: z.string().optional(),
  effort: z.string().optional(),
  risk: z.nativeEnum(Risk).optional(),
})

const taskSchema = taskFormSchema.transform(data => ({
  ...data,
  effort: data.effort === "" || data.effort === null || data.effort === undefined 
    ? undefined 
    : (() => {
        const num = Number(data.effort);
        return isNaN(num) ? undefined : num;
      })()
}))

type TaskFormData = z.infer<typeof taskFormSchema>

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task
  onTaskSaved?: () => void
}

export function TaskDialog({ open, onOpenChange, task, onTaskSaved }: TaskDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([])
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      area: "",
      subArea: "",
      owner: "",
      priority: Priority.MEDIUM,
      status: Status.TODO,
      dueDate: "",
      startDate: "",
      effort: undefined,
      risk: undefined,
    },
  })

  useEffect(() => {
    if (open) {
      fetchUsers()
      if (task) {
        // Populate form with task data
        setValue("title", task.title)
        setValue("description", task.description || "")
        setValue("area", task.area)
        setValue("subArea", task.subArea || "")
        setValue("owner", task.ownerId) // Use ownerId for the dropdown value
        setValue("priority", task.priority)
        setValue("status", task.status)
        setValue("dueDate", task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "")
        setValue("startDate", task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : "")
        setValue("effort", task.effort?.toString() || "")
        setValue("risk", task.risk || undefined)
      } else {
        reset()
      }
    }
  }, [open, task, setValue, reset])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Failed to fetch users:", error)
    }
  }

  const onSubmit = async (formData: TaskFormData) => {
    const data = taskSchema.parse(formData)
    setIsLoading(true)
    // Clean up the data - convert empty strings to undefined for optional fields
    const cleanedData = {
      ...data,
      description: data.description === "" ? undefined : data.description,
      subArea: data.subArea === "" ? undefined : data.subArea,
      dueDate: data.dueDate === "" ? undefined : data.dueDate,
      startDate: data.startDate === "" ? undefined : data.startDate,
    }
    
    console.log("Form data being sent:", cleanedData)
    try {
      const url = task ? `/api/tasks/${task.id}` : "/api/tasks"
      const method = task ? "PUT" : "POST"
      
      console.log("Sending request to:", url, "with method:", method)
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedData),
      })
      
      console.log("Response status:", response.status)

      if (response.ok) {
        toast.success(task ? "Task updated successfully" : "Task created successfully")
        onOpenChange(false)
        reset()
        // Call the callback to refresh the task list
        if (onTaskSaved) {
          onTaskSaved()
        } else {
          // Fallback to page reload if no callback provided
          window.location.reload()
        }
      } else {
        const errorData = await response.json()
        console.error("API Error:", errorData)
        throw new Error(errorData.error || "Failed to save task")
      }
    } catch (error) {
      toast.error((error as any)?.message || "Failed to save task")
      console.error("Error saving task:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update the task details below." : "Fill in the details to create a new task."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Enter task title"
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Area *</Label>
              <Input
                id="area"
                {...register("area")}
                placeholder="Enter area"
              />
              {errors.area && (
                <p className="text-sm text-red-600">{errors.area.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subArea">Sub-Area</Label>
            <Input
              id="subArea"
              {...register("subArea")}
              placeholder="Enter sub-area"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner">Owner *</Label>
            <Select
              value={watch("owner")}
              onValueChange={(value) => setValue("owner", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select owner" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.owner && (
              <p className="text-sm text-red-600">{errors.owner.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">End Product</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter end product"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={watch("priority")}
                onValueChange={(value) => setValue("priority", value as Priority)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Priority).map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value as Status)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Status).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="risk">Risk</Label>
              <Select
                value={watch("risk") || "NONE"}
                onValueChange={(value) => setValue("risk", value === "NONE" ? undefined : value as Risk)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  {Object.values(Risk).map((risk) => (
                    <SelectItem key={risk} value={risk}>
                      {risk}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                {...register("dueDate")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="effort">Effort (hours) - Optional</Label>
              <Input
                id="effort"
                type="number"
                {...register("effort")}
                placeholder="0"
              />
              {errors.effort && (
                <p className="text-sm text-red-600">{errors.effort.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : task ? "Update Task" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState, useEffect } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Filter, Download, Eye, EyeOff, Edit, Trash2, RotateCcw, CheckCircle, EyeIcon } from "lucide-react"
import { Task, Priority, Status, Risk } from "@/types/task"
import { TaskDialog } from "@/components/task-dialog"
import { toast } from "sonner"

const priorityColors = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
}

const statusColors = {
  TODO: "bg-gray-100 text-gray-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  IN_REVIEW: "bg-purple-100 text-purple-800",
  DONE: "bg-green-100 text-green-800",
  BLOCKED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
}

const riskColors = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
}

interface TaskTableProps {
  statusFilter?: "active" | "done"
  onTaskSaved?: () => void
}

export function TaskTable({ statusFilter = "active", onTaskSaved }: TaskTableProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [viewingTask, setViewingTask] = useState<Task | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [statusFilter])

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks")
      const data = await response.json()
      
      // Filter tasks based on status
      const filteredTasks = data.filter((task: Task) => {
        if (statusFilter === "done") {
          return task.status === Status.DONE
        } else {
          return task.status !== Status.DONE
        }
      })
      
      setTasks(filteredTasks)
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditTask = (task: Task) => {
    console.log("Editing task:", task)
    setEditingTask(task)
    setIsTaskDialogOpen(true)
  }

  const handleViewTask = (task: Task) => {
    console.log("Viewing task:", task)
    setViewingTask(task)
    setIsViewDialogOpen(true)
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Task deleted successfully")
        fetchTasks() // Refresh the task list
      } else {
        throw new Error("Failed to delete task")
      }
    } catch (error) {
      toast.error("Failed to delete task")
      console.error("Error deleting task:", error)
    }
  }

  const handleTaskSaved = () => {
    setEditingTask(null)
    setIsTaskDialogOpen(false)
    fetchTasks() // Refresh the task list
    // Call parent callback if provided
    if (onTaskSaved) {
      onTaskSaved()
    }
  }

  const handleRestoreTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: Status.IN_PROGRESS }),
      })

      if (response.ok) {
        toast.success("Task restored successfully")
        fetchTasks() // Refresh the task list
      } else {
        throw new Error("Failed to restore task")
      }
    } catch (error) {
      toast.error("Failed to restore task")
      console.error("Error restoring task:", error)
    }
  }

  const handleQuickUpdate = async (taskId: string, field: string, value: string | number | null) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [field]: value }),
      })

      if (response.ok) {
        if (field === "status" && value === Status.DONE) {
          toast.success("Task completed! It will be moved to Done Tasks.")
        } else {
          toast.success("Task updated successfully")
        }
        fetchTasks() // Refresh the task list
      } else {
        throw new Error("Failed to update task")
      }
    } catch (error) {
      toast.error("Failed to update task")
      console.error("Error updating task:", error)
    }
  }

  const columns: ColumnDef<Task>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const task = row.original
        const isDone = task.status === Status.DONE
        return (
          <div 
            className={`font-medium whitespace-normal break-words ${isDone ? 'line-through text-gray-500' : ''}`} 
            title={row.getValue("title")}
          >
            {row.getValue("title")}
          </div>
        )
      },
      size: 300,
    },
    {
      accessorKey: "area",
      header: "Area",
      cell: ({ row }) => (
        <div className="truncate font-medium" title={row.getValue("area")}>
          {row.getValue("area")}
        </div>
      ),
      size: 140,
    },
    {
      accessorKey: "subArea",
      header: "Sub-Area",
      cell: ({ row }) => {
        const value = row.getValue("subArea") as string
        return value ? (
          <div className="whitespace-normal break-words text-sm" title={value}>
            {value}
          </div>
        ) : "-"
      },
      size: 280,
    },
    {
      accessorKey: "description",
      header: "End Product",
      cell: ({ row }) => {
        const value = row.getValue("description") as string
        return value ? (
          <div className="whitespace-normal break-words text-sm" title={value}>
            {value}
          </div>
        ) : "-"
      },
      size: 320,
    },
    {
      accessorKey: "owner",
      header: "Owner",
      cell: ({ row }) => {
        const task = row.original as any
        
        // Show the owner's name
        const displayName = task.owner?.name || "-"
        
        return (
          <div className="font-medium whitespace-normal break-words" title={displayName}>
            {displayName}
          </div>
        )
      },
      size: 180,
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const task = row.original
        const priority = row.getValue("priority") as Priority
        return statusFilter === "done" ? (
          <Badge className={`${priorityColors[priority]} text-xs px-1 py-0`}>
            {priority}
          </Badge>
        ) : (
              <Select
                value={priority}
                onValueChange={(value) => handleQuickUpdate(task.id, "priority", value)}
              >
                <SelectTrigger className="w-16 h-5 p-0 border-0 bg-transparent">
                  <Badge className={`${priorityColors[priority]} text-xs px-1 py-0`}>
                    {priority}
                  </Badge>
                </SelectTrigger>
            <SelectContent>
              {Object.values(Priority).map((p) => (
                <SelectItem key={p} value={p}>
                  <Badge className={`${priorityColors[p]} text-xs px-1 py-0`}>
                    {p}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      },
      size: 100,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const task = row.original
        const status = row.getValue("status") as Status
        return statusFilter === "done" ? (
          <Badge className={`${statusColors[status]} text-xs px-1 py-0`}>
            {status.replace("_", " ")}
          </Badge>
        ) : (
              <Select
                value={status}
                onValueChange={(value) => handleQuickUpdate(task.id, "status", value)}
              >
                <SelectTrigger className="w-20 h-5 p-0 border-0 bg-transparent">
                  <Badge className={`${statusColors[status]} text-xs px-1 py-0`}>
                    {status.replace("_", " ")}
                  </Badge>
                </SelectTrigger>
            <SelectContent>
              {Object.values(Status).map((s) => (
                <SelectItem key={s} value={s}>
                  <Badge className={`${statusColors[s]} text-xs px-1 py-0`}>
                    {s.replace("_", " ")}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      },
      size: 120,
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => {
        const task = row.original
        const date = row.getValue("dueDate") as string
        const formattedDate = date ? new Date(date).toISOString().split('T')[0] : ""
        
        return statusFilter === "done" ? (
          <span className="text-sm">{date ? new Date(date).toLocaleDateString() : "-"}</span>
        ) : (
              <Input
                type="date"
                value={formattedDate}
                onChange={(e) => handleQuickUpdate(task.id, "dueDate", e.target.value)}
                className="w-24 h-5 text-xs"
              />
        )
      },
      size: 140,
    },
    {
      accessorKey: "effort",
      header: "Effort (h)",
      cell: ({ row }) => {
        const task = row.original
        const effort = row.getValue("effort") as number
        
        return statusFilter === "done" ? (
          <span className="text-sm">{effort ? `${effort}h` : "-"}</span>
        ) : (
              <Input
                type="number"
                value={effort || ""}
                onChange={(e) => handleQuickUpdate(task.id, "effort", e.target.value ? parseInt(e.target.value) : null)}
                className="w-10 h-5 text-xs"
                placeholder="0"
              />
        )
      },
      size: 100,
    },
    {
      accessorKey: "risk",
      header: "Risk",
      cell: ({ row }) => {
        const risk = row.getValue("risk") as Risk
        return risk ? (
          <Badge className={`${riskColors[risk]} text-xs px-1 py-0`}>
            {risk}
          </Badge>
        ) : "-"
      },
      size: 100,
    },
    ...(statusFilter === "done" ? [{
      accessorKey: "updatedAt",
      header: "Completed",
      cell: ({ row }: { row: { getValue: (key: string) => any } }) => {
        const date = row.getValue("updatedAt") as string
        return (
          <span className="text-sm text-gray-600">
            {new Date(date).toLocaleDateString()}
          </span>
        )
      },
      size: 100,
    }] : []),
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const task = row.original
        return (
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewTask(task)}
              className="h-6 w-6 p-0 hover:bg-gray-100"
              title="View task details"
            >
              <Eye className="h-3 w-3 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditTask(task)}
              className="h-6 w-6 p-0 hover:bg-blue-100"
              title="Edit task"
            >
              <Edit className="h-3 w-3 text-blue-600" />
            </Button>
            {statusFilter === "done" ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRestoreTask(task.id)}
                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                title="Restore task"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            ) : (
              <>
                {task.status !== Status.DONE && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuickUpdate(task.id, "status", Status.DONE)}
                    className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                    title="Mark as done"
                  >
                    <CheckCircle className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTask(task.id)}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                  title="Delete task"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        )
      },
      size: 180,
    },
  ]

  const table = useReactTable({
    data: tasks,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading tasks...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-none mx-auto">
      <Card className="w-full modern-card">
        <CardHeader>
          <CardTitle>
            {statusFilter === "done" ? "Completed Tasks" : "Active Tasks"}
          </CardTitle>
          <CardDescription>
            {statusFilter === "done" 
              ? "Review and manage completed tasks" 
              : "Manage and track your active tasks"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
        <div className="flex items-center justify-between py-4 px-6">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Filter tasks..."
              value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("title")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
          <div className="text-sm text-gray-500">
            {table.getFilteredRowModel().rows.length} task{table.getFilteredRowModel().rows.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="rounded-md border overflow-hidden overflow-x-auto">
          <Table className="w-full table-fixed min-w-[1400px]">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-gray-50">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="px-3 py-3 text-sm font-semibold text-gray-700 uppercase tracking-wider bg-gray-50">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-gray-50 border-b border-gray-100"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="px-3 py-3 text-sm align-top border-b border-gray-100">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-gray-500"
                    >
                      {statusFilter === "done" ? "No completed tasks yet." : "No active tasks found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
        </div>
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <div className="flex items-center justify-between py-3 border-t bg-gray-50">
            <div className="text-sm text-gray-600">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} selected
            </div>
          </div>
        )}
      </CardContent>
      
      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={(open) => {
          setIsTaskDialogOpen(open)
          if (!open) {
            setEditingTask(null)
          }
        }}
        task={editingTask || undefined}
        onTaskSaved={handleTaskSaved}
      />

      {/* View Task Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {viewingTask?.title}
            </DialogTitle>
            <DialogDescription>
              View complete task details and full content
            </DialogDescription>
          </DialogHeader>
          
          {viewingTask && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Area</h4>
                  <p className="text-sm">{viewingTask.area || "-"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Sub-Area</h4>
                  <p className="text-sm">{viewingTask.subArea || "-"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">End Product</h4>
                  <p className="text-sm">{viewingTask.description || "-"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Owner</h4>
                  <p className="text-sm">{viewingTask.owner?.name || "-"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Priority</h4>
                  <Badge className={priorityColors[viewingTask.priority]}>
                    {viewingTask.priority}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Status</h4>
                  <Badge className={statusColors[viewingTask.status]}>
                    {viewingTask.status.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Due Date</h4>
                  <p className="text-sm">
                    {viewingTask.dueDate ? new Date(viewingTask.dueDate).toLocaleDateString() : "-"}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Start Date</h4>
                  <p className="text-sm">
                    {viewingTask.startDate ? new Date(viewingTask.startDate).toLocaleDateString() : "-"}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Effort (Hours)</h4>
                  <p className="text-sm">{viewingTask.effort ? `${viewingTask.effort}h` : "-"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Risk</h4>
                  {viewingTask.risk ? (
                    <Badge className={riskColors[viewingTask.risk]}>
                      {viewingTask.risk}
                    </Badge>
                  ) : (
                    <span className="text-sm">-</span>
                  )}
                </div>
              </div>

              {/* Description */}
              {viewingTask.description && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Description</h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{viewingTask.description}</p>
                  </div>
                </div>
              )}


              {/* Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Created</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(viewingTask.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Last Updated</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(viewingTask.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </Card>
    </div>
  )
}

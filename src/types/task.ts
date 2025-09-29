export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum Status {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE",
  BLOCKED = "BLOCKED",
  CANCELLED = "CANCELLED",
}

export enum Risk {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  title: string
  description: string | null
  area: string
  subArea: string | null
  endProduct: string | null
  ownerId: string
  priority: Priority
  status: Status
  acceptanceCriteria: string | null
  dueDate: Date | null
  startDate: Date | null
  effort: number | null
  risk: Risk | null
  createdAt: Date
  updatedAt: Date
  owner?: User
  subtasks?: Subtask[]
  dependencies?: TaskDependency[]
  dependents?: TaskDependency[]
  comments?: Comment[]
  attachments?: Attachment[]
  activities?: Activity[]
}

export interface Subtask {
  id: string
  title: string
  description: string | null
  completed: boolean
  taskId: string
  createdAt: Date
  updatedAt: Date
}

export interface TaskDependency {
  id: string
  taskId: string
  dependentId: string
  createdAt: Date
  task?: Task
  dependent?: Task
}

export interface Comment {
  id: string
  content: string
  taskId: string
  userId: string
  createdAt: Date
  updatedAt: Date
  user?: User
}

export interface Attachment {
  id: string
  filename: string
  url: string
  size: number
  mimeType: string
  taskId: string
  createdAt: Date
}

export interface Activity {
  id: string
  type: string
  message: string
  taskId: string | null
  userId: string
  metadata: Record<string, unknown> | null
  createdAt: Date
  user?: User
  task?: Task
}

export interface TaskView {
  id: string
  name: string
  filters: Record<string, unknown>
  columns: Record<string, unknown>
  sortBy: string | null
  sortOrder: string | null
  taskId: string | null
  userId: string | null
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

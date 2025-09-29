# SCC Task Manager

A professional, modern task management web application built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### Core Fields

- **Area** - Project area classification
- **Sub-Area** - More specific categorization
- **End Product** - Deliverable description
- **Owner** - Task assignee
- **Priority** - LOW, MEDIUM, HIGH, URGENT
- **Status** - TODO, IN_PROGRESS, IN_REVIEW, DONE, BLOCKED, CANCELLED

### Enhanced Features

- **Acceptance Criteria** - Detailed requirements
- **Due/Start Dates** - Timeline management
- **Effort Estimation** - Time tracking in hours
- **Risk Assessment** - LOW, MEDIUM, HIGH, CRITICAL
- **Dependencies** - Task relationships
- **Subtasks** - Task breakdown
- **Comments** - Collaboration and feedback
- **Attachments** - File support
- **Activity Log** - Complete audit trail
- **Saved Views** - Custom filters and layouts
- **Real-time Dashboard** - Live updates and analytics

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: lucide-react
- **Database**: Prisma + PostgreSQL
- **Authentication**: NextAuth.js
- **Forms**: React Hook Form + Zod validation
- **Real-time**: Socket.IO
- **Tables**: TanStack Table
- **Testing**: Vitest + Playwright

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd scc-task-manager
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your database URL and other configuration:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/scc_task_manager?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   SOCKET_IO_URL="http://localhost:3000"
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Seed with sample data
   npm run db:seed
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Demo Accounts

The application comes pre-seeded with three demo accounts:

- **Anderson Meta**: anderson@example.com
- **Boris Toma**: boris@example.com
- **Vladimir Medic**: vladimir@example.com

Password for all accounts: `password123`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run E2E tests

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard.tsx     # Main dashboard
│   ├── task-table.tsx    # Task management table
│   ├── task-dialog.tsx   # Task creation/editing
│   └── activity-feed.tsx # Activity timeline
├── lib/                  # Utilities and configurations
│   ├── auth.ts          # NextAuth configuration
│   ├── prisma.ts        # Prisma client
│   └── utils.ts         # Utility functions
└── types/               # TypeScript type definitions
    └── task.ts          # Task-related types
```

## Key Features

### Real-time Updates

- Live task updates across all users
- Activity feed with real-time notifications
- Collaborative editing capabilities

### Advanced Task Management

- Comprehensive task fields and metadata
- Subtask breakdown and tracking
- Dependency management
- Risk assessment and priority management

### Modern UI/UX

- Responsive design with Tailwind CSS
- Accessible components with shadcn/ui
- Intuitive task management interface
- Customizable views and filters

### Developer Experience

- TypeScript for type safety
- ESLint and Prettier for code quality
- Husky for pre-commit hooks
- Comprehensive testing setup

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.

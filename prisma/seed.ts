import { PrismaClient, Priority, Status, Risk } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10)

  const anderson = await prisma.user.upsert({
    where: { email: 'anderson@example.com' },
    update: {},
    create: {
      email: 'anderson@example.com',
      name: 'Anderson Meta',
      password: hashedPassword,
    },
  })

  const boris = await prisma.user.upsert({
    where: { email: 'boris@example.com' },
    update: {},
    create: {
      email: 'boris@example.com',
      name: 'Boris Toma',
      password: hashedPassword,
    },
  })

  const vladimir = await prisma.user.upsert({
    where: { email: 'vladimir@example.com' },
    update: {},
    create: {
      email: 'vladimir@example.com',
      name: 'Vladimir Medic',
      password: hashedPassword,
    },
  })

  console.log('✅ Users created')

  // Create sample tasks
  const tasks = [
    {
      title: 'Implement user authentication system',
      description: 'Set up NextAuth with email/password authentication and prepare for OAuth integration',
      area: 'Backend Development',
      subArea: 'Authentication',
      endProduct: 'Secure login system',
      ownerId: anderson.id,
      priority: Priority.HIGH,
      status: Status.IN_PROGRESS,
      acceptanceCriteria: 'Users can sign in with email/password, session management works, OAuth structure is ready',
      dueDate: new Date('2024-02-15'),
      startDate: new Date('2024-01-20'),
      effort: 16,
      risk: Risk.MEDIUM,
    },
    {
      title: 'Design task management UI',
      description: 'Create modern, responsive UI components for task management using shadcn/ui',
      area: 'Frontend Development',
      subArea: 'UI/UX',
      endProduct: 'Task management interface',
      ownerId: boris.id,
      priority: Priority.HIGH,
      status: Status.TODO,
      acceptanceCriteria: 'All task CRUD operations work, responsive design, accessible components',
      dueDate: new Date('2024-02-20'),
      startDate: new Date('2024-01-25'),
      effort: 24,
      risk: Risk.LOW,
    },
    {
      title: 'Set up real-time updates',
      description: 'Implement Socket.IO for real-time task updates and activity feed',
      area: 'Backend Development',
      subArea: 'Real-time Features',
      endProduct: 'Live updates system',
      ownerId: vladimir.id,
      priority: Priority.MEDIUM,
      status: Status.TODO,
      acceptanceCriteria: 'Changes appear instantly, activity feed updates, presence indicators work',
      dueDate: new Date('2024-02-25'),
      startDate: new Date('2024-02-01'),
      effort: 12,
      risk: Risk.MEDIUM,
    },
    {
      title: 'Database schema optimization',
      description: 'Optimize Prisma schema and database queries for better performance',
      area: 'Backend Development',
      subArea: 'Database',
      endProduct: 'Optimized database',
      ownerId: anderson.id,
      priority: Priority.LOW,
      status: Status.DONE,
      acceptanceCriteria: 'Query performance improved, indexes added, schema optimized',
      dueDate: new Date('2024-01-30'),
      startDate: new Date('2024-01-15'),
      effort: 8,
      risk: Risk.LOW,
    },
    {
      title: 'Implement testing framework',
      description: 'Set up Vitest for unit tests and Playwright for E2E testing',
      area: 'Quality Assurance',
      subArea: 'Testing',
      endProduct: 'Testing infrastructure',
      ownerId: boris.id,
      priority: Priority.MEDIUM,
      status: Status.IN_REVIEW,
      acceptanceCriteria: 'Unit tests cover critical functions, E2E tests cover main flows',
      dueDate: new Date('2024-02-10'),
      startDate: new Date('2024-01-28'),
      effort: 20,
      risk: Risk.LOW,
    },
    {
      title: 'Set up CI/CD pipeline',
      description: 'Configure GitHub Actions for automated testing and deployment',
      area: 'DevOps',
      subArea: 'CI/CD',
      endProduct: 'Automated deployment',
      ownerId: vladimir.id,
      priority: Priority.HIGH,
      status: Status.BLOCKED,
      acceptanceCriteria: 'Tests run on PR, automatic deployment to staging, production deployment process',
      dueDate: new Date('2024-02-28'),
      startDate: new Date('2024-02-05'),
      effort: 16,
      risk: Risk.HIGH,
    },
  ]

  for (const taskData of tasks) {
    const task = await prisma.task.create({
      data: taskData,
    })

    // Create activity log entry
    await prisma.activity.create({
      data: {
        type: 'created',
        message: `Task "${task.title}" was created`,
        taskId: task.id,
        userId: task.ownerId,
      },
    })

    // Create some sample subtasks
    if (task.title.includes('user authentication')) {
      await prisma.subtask.createMany({
        data: [
          {
            title: 'Set up NextAuth configuration',
            taskId: task.id,
            completed: true,
          },
          {
            title: 'Create login/signup pages',
            taskId: task.id,
            completed: true,
          },
          {
            title: 'Implement session management',
            taskId: task.id,
            completed: false,
          },
          {
            title: 'Prepare OAuth structure',
            taskId: task.id,
            completed: false,
          },
        ],
      })
    }

    // Create some sample comments
    if (task.title.includes('UI')) {
      await prisma.comment.create({
        data: {
          content: 'Great progress on the design! The components look clean and modern.',
          taskId: task.id,
          userId: anderson.id,
        },
      })
    }
  }

  console.log('✅ Sample tasks created')

  // Create some additional activities
  const activities = [
    {
      type: 'status_changed',
      message: 'Task "Database schema optimization" was marked as DONE',
      userId: anderson.id,
      metadata: { previousStatus: 'IN_PROGRESS', newStatus: 'DONE' },
    },
    {
      type: 'commented',
      message: 'Added feedback on UI design',
      userId: anderson.id,
      metadata: { commentId: 'comment-1' },
    },
    {
      type: 'assigned',
      message: 'Task "Set up CI/CD pipeline" was assigned to Vladimir Medic',
      userId: vladimir.id,
      metadata: { taskTitle: 'Set up CI/CD pipeline' },
    },
  ]

  for (const activityData of activities) {
    await prisma.activity.create({
      data: activityData,
    })
  }

  console.log('✅ Sample activities created')
  console.log('🎉 Database seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

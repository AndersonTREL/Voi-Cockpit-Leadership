const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJByJXTdtrl2i8u9H8e', // password123
      emailVerified: new Date(),
      role: 'ADMIN',
      isActive: true,
    },
  })

  console.log('✅ Admin user created')

  // Create sample tasks
  const tasks = [
    {
      title: 'Setup project infrastructure',
      description: 'Configure development environment and CI/CD pipeline',
      area: 'Development',
      ownerId: adminUser.id,
      ownerDisplayName: 'Admin User',
      priority: 'HIGH',
      status: 'TODO',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
    {
      title: 'Design user interface',
      description: 'Create wireframes and mockups for the application',
      area: 'Design',
      ownerId: adminUser.id,
      ownerDisplayName: 'Admin User',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    },
    {
      title: 'Implement authentication',
      description: 'Set up user authentication and authorization system',
      area: 'Backend',
      ownerId: adminUser.id,
      ownerDisplayName: 'Admin User',
      priority: 'HIGH',
      status: 'DONE',
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
  ]

  for (const taskData of tasks) {
    const task = await prisma.task.create({
      data: {
        ...taskData,
        priority: taskData.priority,
        status: taskData.status,
      },
    })
    console.log(`✅ Task created: ${task.title}`)
  }

  console.log('🎉 Database seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

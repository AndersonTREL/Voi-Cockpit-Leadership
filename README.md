# SCC Task Manager

A modern, feature-rich task management application built with Next.js, designed for teams to collaborate and manage projects effectively.

## 🚀 Features

### Core Functionality
- **Task Management**: Create, edit, and track tasks with detailed information
- **User Authentication**: Secure login with email verification
- **Role-Based Access Control**: Admin, Manager, User, and Viewer roles
- **Real-time Updates**: Live task updates using Socket.IO
- **Activity Tracking**: Comprehensive activity feed for all actions

### Advanced Features
- **Export Options**: Export tasks to PDF, Excel, and CSV formats
- **Deadline Alerts**: Smart notifications for approaching deadlines
- **Custom Dashboards**: Personalized dashboard widgets
- **Task Search & Filters**: Advanced filtering and search capabilities
- **Admin Panel**: Complete user and role management system
- **Modern UI**: Beautiful, responsive design with glass morphism effects

### Task Properties
- Title, Description, Area, Sub-Area
- End Product, Owner, Priority, Status
- Due Date, Start Date, Effort Estimation
- Risk Assessment, Acceptance Criteria

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI, Shadcn/ui
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Real-time**: Socket.IO
- **Email**: Nodemailer
- **Export**: jsPDF, html2canvas, xlsx, papaparse

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd scc-task-manager
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Email Configuration (for production)
EMAIL_SERVER_HOST="your-smtp-host"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email"
EMAIL_SERVER_PASSWORD="your-password"
EMAIL_FROM="noreply@yourdomain.com"

# Socket.IO
NEXT_PUBLIC_SOCKET_IO_URL="http://localhost:3000"
```

### 4. Set Up Database
```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed initial data
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
scc-task-manager/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── api/            # API routes
│   │   ├── auth/           # Authentication pages
│   │   ├── admin/          # Admin panel
│   │   └── globals.css     # Global styles
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   ├── dashboard.tsx  # Main dashboard
│   │   ├── task-table.tsx # Task management
│   │   └── ...
│   ├── lib/               # Utility libraries
│   │   ├── auth.ts        # Authentication config
│   │   ├── prisma.ts      # Database client
│   │   └── ...
│   └── types/             # TypeScript type definitions
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts           # Database seeding
└── public/               # Static assets
```

## 👥 User Roles

### Administrator
- Full system access
- User management
- Role and permission management
- All task operations

### Manager
- Team management
- Task assignment
- Project oversight
- Export capabilities

### User
- Create and manage own tasks
- View assigned tasks
- Basic reporting

### Viewer
- Read-only access
- View tasks and reports
- No modification rights

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio
- `npm run test` - Run tests
- `npm run test:e2e` - Run end-to-end tests

## 🌐 Deployment Options

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
- **Netlify**: Static site deployment
- **Railway**: Full-stack deployment with database
- **DigitalOcean**: VPS deployment
- **AWS**: Scalable cloud deployment

## 🔐 Security Features

- Secure authentication with NextAuth.js
- Role-based access control
- Email verification for new accounts
- Password reset functionality
- CSRF protection
- Input validation and sanitization

## 📊 Database Schema

The application uses the following main entities:
- **Users**: User accounts and authentication
- **Tasks**: Task management with full lifecycle
- **Roles**: Role-based permissions
- **Activities**: Audit trail and activity tracking
- **Notifications**: Alert system
- **Dashboard Widgets**: Customizable dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation

## 🎯 Roadmap

### Planned Features
- [ ] Calendar View
- [ ] Gantt Chart
- [ ] Weekly/Monthly Reports
- [ ] Team Chat Integration
- [ ] Mobile App
- [ ] Offline Mode
- [ ] Advanced Analytics
- [ ] API Documentation

---

Built with ❤️ for efficient team collaboration and project management.# Environment variables configured for production

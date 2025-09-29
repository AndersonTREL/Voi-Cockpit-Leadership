import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'
import { Parser } from 'papaparse'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { format, filters } = await request.json()

    // Get user's tasks with filters
    const whereClause: any = {
      owner: {
        email: session.user.email
      }
    }

    // Apply filters if provided
    if (filters?.status) {
      whereClause.status = filters.status
    }
    if (filters?.priority) {
      whereClause.priority = filters.priority
    }
    if (filters?.dateFrom) {
      whereClause.createdAt = {
        ...whereClause.createdAt,
        gte: new Date(filters.dateFrom)
      }
    }
    if (filters?.dateTo) {
      whereClause.createdAt = {
        ...whereClause.createdAt,
        lte: new Date(filters.dateTo)
      }
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    switch (format) {
      case 'excel':
        return await exportToExcel(tasks)
      case 'csv':
        return await exportToCSV(tasks)
      case 'pdf':
        return await exportToPDF(tasks)
      default:
        return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
    }
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}

async function exportToExcel(tasks: any[]) {
  const worksheetData = tasks.map(task => ({
    'Task ID': task.id,
    'Title': task.title,
    'Description': task.description || '',
    'Area': task.area,
    'Sub Area': task.subArea || '',
    'Owner': task.owner.name || task.owner.email,
    'Priority': task.priority,
    'Status': task.status,
    'Due Date': task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '',
    'Start Date': task.startDate ? new Date(task.startDate).toLocaleDateString() : '',
    'Effort (Hours)': task.effort || '',
    'Risk': task.risk || '',
    'Created': new Date(task.createdAt).toLocaleDateString(),
    'Updated': new Date(task.updatedAt).toLocaleDateString()
  }))

  const worksheet = XLSX.utils.json_to_sheet(worksheetData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks')

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="tasks-export-${new Date().toISOString().split('T')[0]}.xlsx"`
    }
  })
}

async function exportToCSV(tasks: any[]) {
  const csvData = tasks.map(task => ({
    'Task ID': task.id,
    'Title': task.title,
    'Description': task.description || '',
    'Area': task.area,
    'Sub Area': task.subArea || '',
    'Owner': task.owner.name || task.owner.email,
    'Priority': task.priority,
    'Status': task.status,
    'Due Date': task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '',
    'Start Date': task.startDate ? new Date(task.startDate).toLocaleDateString() : '',
    'Effort (Hours)': task.effort || '',
    'Risk': task.risk || '',
    'Created': new Date(task.createdAt).toLocaleDateString(),
    'Updated': new Date(task.updatedAt).toLocaleDateString()
  }))

  const csv = new Parser().unparse(csvData)
  
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="tasks-export-${new Date().toISOString().split('T')[0]}.csv"`
    }
  })
}

async function exportToPDF(tasks: any[]) {
  // For PDF, we'll return the data and let the client handle the PDF generation
  // This is more efficient than server-side PDF generation
  return NextResponse.json({
    success: true,
    data: tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      area: task.area,
      subArea: task.subArea || '',
      owner: task.owner.name || task.owner.email,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '',
      startDate: task.startDate ? new Date(task.startDate).toLocaleDateString() : '',
      effort: task.effort || '',
      risk: task.risk || '',
      createdAt: new Date(task.createdAt).toLocaleDateString(),
      updatedAt: new Date(task.updatedAt).toLocaleDateString()
    })),
    exportDate: new Date().toISOString()
  })
}

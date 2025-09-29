"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Download, FileText, FileSpreadsheet, File } from "lucide-react"
import { toast } from "sonner"

interface ExportDialogProps {
  onExport?: () => void
}

export function ExportDialog({ onExport }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [format, setFormat] = useState<'pdf' | 'excel' | 'csv'>('excel')
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    dateFrom: '',
    dateTo: ''
  })

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format,
          filters: {
            ...filters,
            status: filters.status === 'all' ? undefined : filters.status,
            priority: filters.priority === 'all' ? undefined : filters.priority,
            dateFrom: filters.dateFrom || undefined,
            dateTo: filters.dateTo || undefined
          }
        })
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      if (format === 'pdf') {
        // Handle PDF data response
        const result = await response.json()
        if (result.success) {
          // Generate PDF on client side
          await generatePDF(result.data, result.exportDate)
        }
      } else {
        // Handle file downloads (Excel, CSV)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `tasks-export-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }

      toast.success(`Tasks exported successfully as ${format.toUpperCase()}!`)
      setIsOpen(false)
      if (onExport) onExport()
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export tasks. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const generatePDF = async (data: any[], exportDate: string) => {
    // Dynamic import for PDF generation
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.text('Task Export Report', 20, 20)
    
    // Add export date
    doc.setFontSize(12)
    doc.text(`Exported on: ${new Date(exportDate).toLocaleDateString()}`, 20, 30)
    doc.text(`Total Tasks: ${data.length}`, 20, 40)
    
    // Add table headers
    const headers = ['Title', 'Status', 'Priority', 'Owner', 'Due Date']
    const colWidths = [60, 25, 25, 40, 30]
    let yPosition = 60
    
    doc.setFontSize(10)
    let xPosition = 20
    
    headers.forEach((header, index) => {
      doc.text(header, xPosition, yPosition)
      xPosition += colWidths[index]
    })
    
    yPosition += 10
    
    // Add table rows
    data.slice(0, 20).forEach((task) => { // Limit to 20 tasks for PDF
      xPosition = 20
      const rowData = [
        task.title.substring(0, 25),
        task.status,
        task.priority,
        task.owner.substring(0, 20),
        task.dueDate || 'N/A'
      ]
      
      rowData.forEach((cell, index) => {
        doc.text(cell, xPosition, yPosition)
        xPosition += colWidths[index]
      })
      
      yPosition += 8
      
      // Add new page if needed
      if (yPosition > 280) {
        doc.addPage()
        yPosition = 20
      }
    })
    
    // Save the PDF
    doc.save(`tasks-export-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const getFormatIcon = (formatType: string) => {
    switch (formatType) {
      case 'pdf':
        return <FileText className="h-4 w-4" />
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4" />
      case 'csv':
        return <File className="h-4 w-4" />
      default:
        return <Download className="h-4 w-4" />
    }
  }

  const getFormatDescription = (formatType: string) => {
    switch (formatType) {
      case 'pdf':
        return 'Export as PDF report with formatted layout'
      case 'excel':
        return 'Export as Excel spreadsheet (.xlsx)'
      case 'csv':
        return 'Export as CSV file for data analysis'
      default:
        return ''
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 ease-out"
        >
          <Download className="h-4 w-4" />
          Export Tasks
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Tasks
          </DialogTitle>
          <DialogDescription>
            Choose the format and filters for exporting your tasks.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select value={format} onValueChange={(value: 'pdf' | 'excel' | 'csv') => setFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel (.xlsx)
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4" />
                    CSV (.csv)
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF Report
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              {getFormatDescription(format)}
            </p>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Filters (Optional)</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="IN_REVIEW">In Review</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                    <SelectItem value="BLOCKED">Blocked</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All priorities</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom">From Date</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateTo">To Date</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
          >
            {isExporting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Exporting...
              </>
            ) : (
              <>
                {getFormatIcon(format)}
                Export {format.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

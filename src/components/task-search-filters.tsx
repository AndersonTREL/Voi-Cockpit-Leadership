"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Filter, X, Calendar } from "lucide-react"
import { toast } from "sonner"

interface SearchFilters {
  query: string
  status: string
  priority: string
  owner: string
  dateFrom: string
  dateTo: string
  area: string
}

interface TaskSearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void
  onSearch: (query: string) => void
  isLoading?: boolean
}

export function TaskSearchFilters({ onFiltersChange, onSearch, isLoading = false }: TaskSearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    status: 'all',
    priority: 'all',
    owner: '',
    dateFrom: '',
    dateTo: '',
    area: ''
  })
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    
    // Count active filters (excluding query and 'all' values)
    const count = Object.entries(updatedFilters)
      .filter(([key, value]) => key !== 'query' && value !== '' && value !== 'all')
      .length
    setActiveFiltersCount(count)
    
    onFiltersChange(updatedFilters)
  }

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      query: '',
      status: 'all',
      priority: 'all',
      owner: '',
      dateFrom: '',
      dateTo: '',
      area: ''
    }
    setFilters(clearedFilters)
    setActiveFiltersCount(0)
    onFiltersChange(clearedFilters)
    onSearch('')
  }

  const handleSearch = () => {
    onSearch(filters.query)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tasks by title, description, or area..."
            value={filters.query}
            onChange={(e) => updateFilters({ query: e.target.value })}
            onKeyPress={handleKeyPress}
            className="pl-10 pr-4 py-2 border-gray-300 focus:border-teal-500 focus:ring-teal-500"
            disabled={isLoading}
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={isLoading || !filters.query.trim()}
          className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white border-0"
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        
        {/* Advanced Filters Button */}
        <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="relative"
              disabled={isLoading}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 bg-teal-600 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Advanced Filters
              </DialogTitle>
              <DialogDescription>
                Filter tasks by multiple criteria to find exactly what you're looking for.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={filters.status} onValueChange={(value) => updateFilters({ status: value })}>
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

              {/* Priority Filter */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={filters.priority} onValueChange={(value) => updateFilters({ priority: value })}>
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

              {/* Area Filter */}
              <div className="space-y-2">
                <Label htmlFor="area">Area</Label>
                <Input
                  id="area"
                  placeholder="Filter by area..."
                  value={filters.area}
                  onChange={(e) => updateFilters({ area: e.target.value })}
                />
              </div>

              {/* Owner Filter */}
              <div className="space-y-2">
                <Label htmlFor="owner">Owner</Label>
                <Input
                  id="owner"
                  placeholder="Filter by owner name..."
                  value={filters.owner}
                  onChange={(e) => updateFilters({ owner: e.target.value })}
                />
              </div>

              {/* Date Range Filters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFrom" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    From Date
                  </Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => updateFilters({ dateFrom: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateTo" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    To Date
                  </Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => updateFilters({ dateTo: e.target.value })}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={clearFilters}
                disabled={activeFiltersCount === 0}
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsFiltersOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsFiltersOpen(false)
                    handleSearch()
                  }}
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white border-0"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {filters.status && filters.status !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Status: {filters.status}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => updateFilters({ status: 'all' })}
              />
            </Badge>
          )}
          {filters.priority && filters.priority !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Priority: {filters.priority}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => updateFilters({ priority: 'all' })}
              />
            </Badge>
          )}
          {filters.area && (
            <Badge variant="secondary" className="text-xs">
              Area: {filters.area}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => updateFilters({ area: '' })}
              />
            </Badge>
          )}
          {filters.owner && (
            <Badge variant="secondary" className="text-xs">
              Owner: {filters.owner}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => updateFilters({ owner: '' })}
              />
            </Badge>
          )}
          {(filters.dateFrom || filters.dateTo) && (
            <Badge variant="secondary" className="text-xs">
              Date Range
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => updateFilters({ dateFrom: '', dateTo: '' })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

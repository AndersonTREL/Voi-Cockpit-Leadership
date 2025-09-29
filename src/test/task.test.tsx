import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TaskTable } from '@/components/task-table'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

// Mock NextAuth
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      },
    },
  }),
}))

describe('TaskTable', () => {
  it('renders task table component', () => {
    render(<TaskTable />)
    expect(screen.getByText('Tasks')).toBeInTheDocument()
  })
})



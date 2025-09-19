import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../utils/test-utils'
import { userInteractions } from '../../utils/test-utils'
import { CaptureInput } from '@/components/capture/CaptureInput'

describe('CaptureInput', () => {
  let mockOnTaskCapture: any
  let mockOnDetailedCapture: any

  beforeEach(() => {
    mockOnTaskCapture = vi.fn().mockResolvedValue(undefined)
    mockOnDetailedCapture = vi.fn()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  describe('basic rendering', () => {
    it('should render with default placeholder', () => {
      render(<CaptureInput />)

      expect(screen.getByPlaceholderText("What's on your mind?")).toBeInTheDocument()
    })

    it('should render with custom placeholder', () => {
      render(<CaptureInput placeholder="Enter a task..." />)

      expect(screen.getByPlaceholderText("Enter a task...")).toBeInTheDocument()
    })

    it('should render add task button', () => {
      render(<CaptureInput />)

      expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument()
    })

    it('should render details button when onDetailedCapture is provided', () => {
      render(<CaptureInput onDetailedCapture={mockOnDetailedCapture} />)

      expect(screen.getByRole('button', { name: /details/i })).toBeInTheDocument()
    })

    it('should not render details button when onDetailedCapture is not provided', () => {
      render(<CaptureInput />)

      expect(screen.queryByRole('button', { name: /details/i })).not.toBeInTheDocument()
    })

    it('should auto-focus input when autoFocus is true', () => {
      render(<CaptureInput autoFocus />)

      const input = screen.getByPlaceholderText("What's on your mind?")
      expect(input).toHaveFocus()
    })
  })

  describe('user input', () => {
    it('should update input value when user types', async () => {
      render(<CaptureInput />)
      const input = screen.getByPlaceholderText("What's on your mind?")

      await userInteractions.type(input, 'Test task')

      expect(input).toHaveValue('Test task')
    })

    it('should enable add button when input has content', async () => {
      render(<CaptureInput />)
      const input = screen.getByPlaceholderText("What's on your mind?")
      const addButton = screen.getByRole('button', { name: /add task/i })

      expect(addButton).toBeDisabled()

      await userInteractions.type(input, 'Test task')

      expect(addButton).not.toBeDisabled()
    })

    it('should keep add button disabled for whitespace-only input', async () => {
      render(<CaptureInput />)
      const input = screen.getByPlaceholderText("What's on your mind?")
      const addButton = screen.getByRole('button', { name: /add task/i })

      await userInteractions.type(input, '   ')

      expect(addButton).toBeDisabled()
    })
  })

  describe('immediate save', () => {
    it('should save task when add button is clicked', async () => {
      render(<CaptureInput onTaskCapture={mockOnTaskCapture} />)
      const input = screen.getByPlaceholderText("What's on your mind?")
      const addButton = screen.getByRole('button', { name: /add task/i })

      await userInteractions.type(input, 'Test task')
      await userInteractions.click(addButton)

      expect(mockOnTaskCapture).toHaveBeenCalledWith('Test task')
    })

    it('should save task when Enter key is pressed', async () => {
      render(<CaptureInput onTaskCapture={mockOnTaskCapture} />)
      const input = screen.getByPlaceholderText("What's on your mind?")

      await userInteractions.type(input, 'Test task')
      await userInteractions.keyboard('{Enter}')

      expect(mockOnTaskCapture).toHaveBeenCalledWith('Test task')
    })

    it('should show saving state during save operation', async () => {
      const slowSave = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
      render(<CaptureInput onTaskCapture={slowSave} />)
      const input = screen.getByPlaceholderText("What's on your mind?")
      const addButton = screen.getByRole('button', { name: /add task/i })

      await userInteractions.type(input, 'Test task')
      await userInteractions.click(addButton)

      expect(screen.getByText('Saving...')).toBeInTheDocument()
      expect(addButton).toBeDisabled()
      expect(input).toBeDisabled()
    })

    it('should clear input and show success state after successful save', async () => {
      render(<CaptureInput onTaskCapture={mockOnTaskCapture} />)
      const input = screen.getByPlaceholderText("What's on your mind?")
      const addButton = screen.getByRole('button', { name: /add task/i })

      await userInteractions.type(input, 'Test task')
      await userInteractions.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('Saved!')).toBeInTheDocument()
      })

      expect(input).toHaveValue('')
    })

    it('should show error state when save fails', async () => {
      const failingSave = vi.fn().mockRejectedValue(new Error('Save failed'))
      render(<CaptureInput onTaskCapture={failingSave} />)
      const input = screen.getByPlaceholderText("What's on your mind?")
      const addButton = screen.getByRole('button', { name: /add task/i })

      await userInteractions.type(input, 'Test task')
      await userInteractions.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('Save failed')).toBeInTheDocument()
      })
    })

    it('should trim whitespace from input before saving', async () => {
      render(<CaptureInput onTaskCapture={mockOnTaskCapture} />)
      const input = screen.getByPlaceholderText("What's on your mind?")
      const addButton = screen.getByRole('button', { name: /add task/i })

      await userInteractions.type(input, '  Test task  ')
      await userInteractions.click(addButton)

      expect(mockOnTaskCapture).toHaveBeenCalledWith('Test task')
    })
  })

  describe('auto-save functionality', () => {
    it('should schedule auto-save after typing stops', async () => {
      render(<CaptureInput onTaskCapture={mockOnTaskCapture} />)
      const input = screen.getByPlaceholderText("What's on your mind?")

      await userInteractions.type(input, 'Test task')

      // Show typing state
      expect(screen.getByText('Auto-saving...')).toBeInTheDocument()

      // Fast-forward time to trigger auto-save
      vi.advanceTimersByTime(2000)

      await waitFor(() => {
        expect(mockOnTaskCapture).toHaveBeenCalledWith('Test task')
      })
    })

    it('should cancel auto-save when input is cleared', async () => {
      render(<CaptureInput onTaskCapture={mockOnTaskCapture} />)
      const input = screen.getByPlaceholderText("What's on your mind?")

      await userInteractions.type(input, 'Test task')

      // Clear input before auto-save triggers
      fireEvent.change(input, { target: { value: '' } })

      // Fast-forward time
      vi.advanceTimersByTime(2000)

      expect(mockOnTaskCapture).not.toHaveBeenCalled()
    })

    it('should restart auto-save timer when user continues typing', async () => {
      render(<CaptureInput onTaskCapture={mockOnTaskCapture} />)
      const input = screen.getByPlaceholderText("What's on your mind?")

      await userInteractions.type(input, 'Test')

      // Advance part way through the timer
      vi.advanceTimersByTime(1000)

      // Type more
      await userInteractions.type(input, ' task')

      // Advance the remaining original time (should not trigger save)
      vi.advanceTimersByTime(1000)
      expect(mockOnTaskCapture).not.toHaveBeenCalled()

      // Advance the new timer duration
      vi.advanceTimersByTime(2000)

      await waitFor(() => {
        expect(mockOnTaskCapture).toHaveBeenCalledWith('Test task')
      })
    })
  })

  describe('keyboard shortcuts', () => {
    it('should clear input when Escape is pressed', async () => {
      render(<CaptureInput />)
      const input = screen.getByPlaceholderText("What's on your mind?")

      await userInteractions.type(input, 'Test task')
      expect(input).toHaveValue('Test task')

      await userInteractions.keyboard('{Escape}')

      expect(input).toHaveValue('')
    })

    it('should call onDetailedCapture when Shift+Tab is pressed', async () => {
      render(<CaptureInput onDetailedCapture={mockOnDetailedCapture} />)
      const input = screen.getByPlaceholderText("What's on your mind?")

      input.focus()
      await userInteractions.keyboard('{Shift>}{Tab}{/Shift}')

      expect(mockOnDetailedCapture).toHaveBeenCalled()
    })

    it('should not call onDetailedCapture when Shift+Tab is pressed but onDetailedCapture is not provided', async () => {
      render(<CaptureInput />)
      const input = screen.getByPlaceholderText("What's on your mind?")

      input.focus()
      await userInteractions.keyboard('{Shift>}{Tab}{/Shift}')

      // Should not throw error
      expect(mockOnDetailedCapture).not.toHaveBeenCalled()
    })
  })

  describe('detailed capture', () => {
    it('should call onDetailedCapture when details button is clicked', async () => {
      render(<CaptureInput onDetailedCapture={mockOnDetailedCapture} />)
      const detailsButton = screen.getByRole('button', { name: /details/i })

      await userInteractions.click(detailsButton)

      expect(mockOnDetailedCapture).toHaveBeenCalled()
    })
  })

  describe('visual states', () => {
    it('should apply typing state styles when user is typing', async () => {
      render(<CaptureInput />)
      const input = screen.getByPlaceholderText("What's on your mind?")

      await userInteractions.type(input, 'Test')

      const card = input.closest('.border-2')
      expect(card).toHaveClass('border-brand-teal/50')
    })

    it('should show appropriate icons for different states', async () => {
      render(<CaptureInput onTaskCapture={mockOnTaskCapture} />)
      const input = screen.getByPlaceholderText("What's on your mind?")
      const addButton = screen.getByRole('button', { name: /add task/i })

      // Test saving state
      const slowSave = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
      mockOnTaskCapture.mockImplementationOnce(slowSave)

      await userInteractions.type(input, 'Test task')
      await userInteractions.click(addButton)

      // Should show loading spinner
      expect(screen.getByRole('button', { name: /add task/i }).querySelector('.animate-spin')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper aria labels and screen reader text', () => {
      render(<CaptureInput onDetailedCapture={mockOnDetailedCapture} />)

      expect(screen.getByLabelText(/add task/i)).toBeInTheDocument()
      expect(screen.getByText('Add task')).toHaveClass('sr-only')
    })

    it('should prevent iOS zoom with proper font sizes', () => {
      render(<CaptureInput />)
      const input = screen.getByPlaceholderText("What's on your mind?")

      expect(input).toHaveClass('text-[16px]')
    })

    it('should have touch-friendly button sizes', () => {
      render(<CaptureInput onDetailedCapture={mockOnDetailedCapture} />)
      const addButton = screen.getByRole('button', { name: /add task/i })
      const detailsButton = screen.getByRole('button', { name: /details/i })

      expect(addButton).toHaveClass('min-h-[44px]')
      expect(detailsButton).toHaveClass('min-h-[44px]')
    })
  })

  describe('error handling', () => {
    it('should handle onTaskCapture being undefined', async () => {
      render(<CaptureInput />)
      const input = screen.getByPlaceholderText("What's on your mind?")
      const addButton = screen.getByRole('button', { name: /add task/i })

      await userInteractions.type(input, 'Test task')
      await userInteractions.click(addButton)

      // Should not throw error
      expect(mockOnTaskCapture).not.toHaveBeenCalled()
    })

    it('should handle generic errors gracefully', async () => {
      const failingSave = vi.fn().mockRejectedValue('Generic error')
      render(<CaptureInput onTaskCapture={failingSave} />)
      const input = screen.getByPlaceholderText("What's on your mind?")
      const addButton = screen.getByRole('button', { name: /add task/i })

      await userInteractions.type(input, 'Test task')
      await userInteractions.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to save task')).toBeInTheDocument()
      })
    })
  })

  describe('form submission', () => {
    it('should prevent default form submission', async () => {
      render(<CaptureInput onTaskCapture={mockOnTaskCapture} />)
      const form = screen.getByRole('form')

      const event = new Event('submit', { bubbles: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      fireEvent(form, event)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('cleanup', () => {
    it('should clear timeouts on unmount', () => {
      const { unmount } = render(<CaptureInput onTaskCapture={mockOnTaskCapture} />)

      // This should not throw any errors
      unmount()
    })
  })
})
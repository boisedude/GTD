'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { Task, TaskAction } from '@/types/database'
import { LucideIcon } from 'lucide-react'

interface TaskActionButtonProps {
  task: Task
  action: TaskAction
  onAction: (action: TaskAction) => Promise<void>
  disabled?: boolean
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  icon?: LucideIcon
  tooltip?: string
  children?: React.ReactNode
}

export function TaskActionButton({
  task,
  action,
  onAction,
  disabled = false,
  size = 'default',
  variant = 'default',
  icon: Icon,
  tooltip,
  children
}: TaskActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [actionData, setActionData] = useState<Record<string, string>>({})

  const requiresDialog = action.type === 'defer' || action.type === 'delegate'

  const handleAction = async () => {
    setIsLoading(true)
    try {
      await onAction({
        ...action,
        data: requiresDialog ? actionData : action.data
      })
      setIsOpen(false)
      setActionData({})
    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const buttonContent = (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || isLoading}
      onClick={requiresDialog ? undefined : handleAction}
      title={tooltip}
    >
      {Icon && <Icon className="h-4 w-4 mr-1" />}
      {children || getActionLabel(action.type)}
    </Button>
  )

  if (!requiresDialog) {
    return buttonContent
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {buttonContent}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getDialogTitle(action.type)}</DialogTitle>
          <DialogDescription>
            {getDialogDescription(action.type, task.title)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {action.type === 'defer' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="new-due-date">New Due Date</Label>
                <Input
                  id="new-due-date"
                  type="date"
                  value={actionData.newDueDate || ''}
                  onChange={(e) => setActionData((prev: Record<string, string>) => ({ ...prev, newDueDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defer-reason">Reason (optional)</Label>
                <Textarea
                  id="defer-reason"
                  placeholder="Why are you deferring this task?"
                  value={actionData.reason || ''}
                  onChange={(e) => setActionData((prev: Record<string, string>) => ({ ...prev, reason: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Quick options</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const tomorrow = new Date()
                      tomorrow.setDate(tomorrow.getDate() + 1)
                      setActionData((prev: Record<string, string>) => ({
                        ...prev,
                        newDueDate: tomorrow.toISOString().split('T')[0]
                      }))
                    }}
                  >
                    Tomorrow
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const nextWeek = new Date()
                      nextWeek.setDate(nextWeek.getDate() + 7)
                      setActionData((prev: Record<string, string>) => ({
                        ...prev,
                        newDueDate: nextWeek.toISOString().split('T')[0]
                      }))
                    }}
                  >
                    Next Week
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const nextMonth = new Date()
                      nextMonth.setMonth(nextMonth.getMonth() + 1)
                      setActionData((prev: Record<string, string>) => ({
                        ...prev,
                        newDueDate: nextMonth.toISOString().split('T')[0]
                      }))
                    }}
                  >
                    Next Month
                  </Button>
                </div>
              </div>
            </>
          )}

          {action.type === 'delegate' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="delegate-to">Delegate To</Label>
                <Input
                  id="delegate-to"
                  placeholder="Person or team name"
                  value={actionData.delegateTo || ''}
                  onChange={(e) => setActionData((prev: Record<string, string>) => ({ ...prev, delegateTo: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delegate-due">Follow-up Date (optional)</Label>
                <Input
                  id="delegate-due"
                  type="date"
                  value={actionData.followUpDate || ''}
                  onChange={(e) => setActionData((prev: Record<string, string>) => ({ ...prev, followUpDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delegate-notes">Notes (optional)</Label>
                <Textarea
                  id="delegate-notes"
                  placeholder="Additional context or instructions..."
                  value={actionData.notes || ''}
                  onChange={(e) => setActionData((prev: Record<string, string>) => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleAction} disabled={isLoading}>
            {isLoading ? 'Processing...' : getActionLabel(action.type)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function getActionLabel(actionType: string): string {
  switch (actionType) {
    case 'complete':
      return 'Complete'
    case 'defer':
      return 'Defer'
    case 'delegate':
      return 'Delegate'
    case 'update':
      return 'Update'
    case 'delete':
      return 'Delete'
    default:
      return 'Action'
  }
}

function getDialogTitle(actionType: string): string {
  switch (actionType) {
    case 'defer':
      return 'Defer Task'
    case 'delegate':
      return 'Delegate Task'
    default:
      return 'Confirm Action'
  }
}

function getDialogDescription(actionType: string, taskTitle: string): string {
  switch (actionType) {
    case 'defer':
      return `Reschedule "${taskTitle}" to a later date. You can set a new due date and add a reason for deferring.`
    case 'delegate':
      return `Delegate "${taskTitle}" to someone else. The task will be moved to your "Waiting For" list.`
    default:
      return `Are you sure you want to perform this action on "${taskTitle}"?`
  }
}
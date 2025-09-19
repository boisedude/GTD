'use client'

import { useState } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { EngagementDashboard } from '@/components/engage/EngagementDashboard'
import { TaskDetailPanel } from '@/components/engage/TaskDetailPanel'
import { ContextSelector } from '@/components/engage/ContextSelector'
import { TaskFilters } from '@/components/engage/TaskFilters'
import { OfflineIndicator } from '@/components/engage/OfflineIndicator'
import { useEngagement } from '@/hooks/useEngagement'
import { useTimer } from '@/hooks/useTimer'
import type { Task } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Play, Brain, Filter, Settings, Clock, Zap, Target } from 'lucide-react'

function EngageContent() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [activeView, setActiveView] = useState<'suggestions' | 'filtered' | 'timer'>('suggestions')

  const engagement = useEngagement({
    maxSuggestions: 8
  })

  const timer = useTimer({
    onComplete: (session) => {
      console.log('Timer session completed:', session)
      // TODO: Save timer session to database
    }
  })

  const {
    suggestions,
    filteredTasks,
    activeFilters,
    context,
    loading,
    updateContext,
    updateFilters,
    executeAction
  } = engagement

  // Get the next best suggestion
  const nextTask = suggestions[0]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Play className="h-6 w-6 text-blue-600" />
                  Engage
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Focus on what matters most right now
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  {suggestions.length} suggestions
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  {filteredTasks.length} filtered
                </Badge>
                <OfflineIndicator />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? 'bg-blue-50 border-blue-200' : ''}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Filters
                </Button>
              </div>
            </div>

            {/* Context Selector */}
            <div className="mt-4">
              <ContextSelector
                context={context}
                onContextChange={updateContext}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Next Action Highlight */}
            {nextTask && !timer.isRunning && (
              <Card className="border-l-4 border-blue-500 bg-blue-50/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      What to do next
                    </CardTitle>
                    <Button
                      onClick={() => setSelectedTask(nextTask.task)}
                      size="sm"
                    >
                      Start Task
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-medium text-gray-900 mb-2">
                    {nextTask.task.title}
                  </h3>
                  {nextTask.task.description && (
                    <p className="text-gray-600 text-sm mb-3">
                      {nextTask.task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-green-700">
                    <Zap className="h-3 w-3" />
                    <span>Score: {nextTask.score}</span>
                    <span>•</span>
                    <span>{nextTask.reasons.join(', ')}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timer Display */}
            {timer.isRunning && (
              <Card className="border-l-4 border-orange-500 bg-orange-50/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-mono font-bold text-orange-900">
                        {timer.formattedTime}
                      </div>
                      {timer.currentSession && (
                        <p className="text-orange-700 text-sm mt-1">
                          Working on task timer
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {timer.isPaused ? (
                        <Button onClick={timer.resume} size="sm">
                          Resume
                        </Button>
                      ) : (
                        <Button onClick={timer.pause} size="sm" variant="outline">
                          Pause
                        </Button>
                      )}
                      <Button onClick={() => timer.stop()} size="sm" variant="outline">
                        Stop
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main Task Views */}
            <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'suggestions' | 'filtered' | 'timer')}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="suggestions" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Suggestions
                </TabsTrigger>
                <TabsTrigger value="filtered" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtered
                </TabsTrigger>
                <TabsTrigger value="timer" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Timer
                </TabsTrigger>
              </TabsList>

              <TabsContent value="suggestions" className="mt-4">
                <EngagementDashboard
                  suggestions={suggestions}
                  onTaskSelect={setSelectedTask}
                  onTaskAction={executeAction}
                  loading={loading}
                />
              </TabsContent>

              <TabsContent value="filtered" className="mt-4">
                <EngagementDashboard
                  suggestions={filteredTasks.map(task => ({ task, score: 0, reasons: [] }))}
                  onTaskSelect={setSelectedTask}
                  onTaskAction={executeAction}
                  loading={loading}
                  showScoring={false}
                />
              </TabsContent>

              <TabsContent value="timer" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Focus Timer</CardTitle>
                    <CardDescription>
                      Use time-blocking to maintain focus on your most important tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!timer.isRunning ? (
                      <div className="space-y-4">
                        <p className="text-gray-600">
                          Select a task from your suggestions to start a focused work session.
                        </p>
                        {suggestions.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium">Quick start with top suggestions:</h4>
                            {suggestions.slice(0, 3).map((suggestion) => (
                              <div
                                key={suggestion.task.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <span className="font-medium">{suggestion.task.title}</span>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    timer.start(suggestion.task.id, 25) // Default 25-minute Pomodoro
                                    setSelectedTask(suggestion.task)
                                  }}
                                >
                                  Start 25min
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="text-6xl font-mono font-bold text-blue-600">
                          {timer.formattedTime}
                        </div>
                        <div className="flex justify-center gap-2">
                          {timer.isPaused ? (
                            <Button onClick={timer.resume}>Resume</Button>
                          ) : (
                            <Button onClick={timer.pause} variant="outline">Pause</Button>
                          )}
                          <Button onClick={() => timer.stop()} variant="outline">Stop</Button>
                          <Button onClick={timer.reset} variant="ghost">Reset</Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Filters Panel */}
            {showFilters && (
              <TaskFilters
                filters={activeFilters}
                onFiltersChange={updateFilters}
                onClose={() => setShowFilters(false)}
              />
            )}

            {/* Task Detail Panel */}
            {selectedTask && (
              <TaskDetailPanel
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                onAction={executeAction}
                onStartTimer={(taskId, duration) => {
                  timer.start(taskId, duration)
                }}
                timerState={{
                  isRunning: timer.isRunning,
                  currentTaskId: timer.currentSession?.task_id
                }}
              />
            )}

            {/* Context Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Current Context</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Location:</span>
                  <span className="capitalize">{context.current_location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Energy:</span>
                  <span className="capitalize">{context.current_energy}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Available Time:</span>
                  <span>{context.available_time}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EngagePage() {
  return (
    <ProtectedRoute>
      <EngageContent />
    </ProtectedRoute>
  )
}
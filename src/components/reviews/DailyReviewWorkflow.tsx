"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useReviews } from "@/hooks/useReviews";
import { useTasks } from "@/hooks/useTasks";
import {
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Pause,
  Play,
  Target,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Coffee,
  X,
} from "lucide-react";
import type { Task, DailyReviewData, ReviewStepType } from "@/types/database";

interface DailyReviewWorkflowProps {
  onClose?: () => void;
  onComplete?: () => void;
}

const DAILY_REVIEW_STEPS: Array<{
  id: ReviewStepType;
  title: string;
  description: string;
  timeEstimate: string;
  icon: React.ComponentType<{ className?: string }>;
  required: boolean;
}> = [
  {
    id: "welcome",
    title: "Welcome to Daily Review",
    description: "Quick check-in with your GTD system",
    timeEstimate: "1 min",
    icon: Coffee,
    required: true,
  },
  {
    id: "calendar_check",
    title: "Calendar Check",
    description: "Review today&apos;s commitments and appointments",
    timeEstimate: "1 min",
    icon: Calendar,
    required: true,
  },
  {
    id: "task_triage",
    title: "Task Triage",
    description: "Review and organize today&apos;s tasks",
    timeEstimate: "2-3 min",
    icon: Target,
    required: true,
  },
  {
    id: "waiting_for_review",
    title: "Waiting For Review",
    description: "Check items you&apos;re waiting on from others",
    timeEstimate: "1 min",
    icon: Clock,
    required: true,
  },
  {
    id: "planning",
    title: "Tomorrow Planning",
    description: "Set intentions for tomorrow",
    timeEstimate: "2 min",
    icon: ArrowRight,
    required: true,
  },
  {
    id: "reflection",
    title: "Quick Reflection",
    description: "Note insights and improvements",
    timeEstimate: "1 min",
    icon: Lightbulb,
    required: false,
  },
];

export function DailyReviewWorkflow({
  onClose,
  onComplete,
}: DailyReviewWorkflowProps) {
  const {
    currentSession,
    dailyReviewData,
    loading,
    startReview,
    pauseReview,
    resumeReview,
    completeReviewStep,
    completeReview,
    abandonReview,
    loadDailyReviewData,
  } = useReviews();

  const { updateTask } = useTasks();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepData, setStepData] = useState<Record<string, unknown>>({});
  const [isStarted, setIsStarted] = useState(false);

  const currentStep = DAILY_REVIEW_STEPS[currentStepIndex];
  const isPaused = currentSession?.status === "paused";
  const totalSteps = DAILY_REVIEW_STEPS.length;

  // Initialize or resume review
  useEffect(() => {
    if (currentSession && currentSession.type === "daily") {
      setIsStarted(true);
      setCurrentStepIndex(currentSession.current_step);
      setStepData(currentSession.session_data || {});
    }
  }, [currentSession]);

  // Start review
  const handleStartReview = async () => {
    try {
      await startReview("daily");
      setIsStarted(true);
    } catch (err) {
      console.error("Failed to start daily review:", err);
    }
  };

  // Resume paused review
  const handleResumeReview = async () => {
    try {
      await resumeReview();
    } catch (err) {
      console.error("Failed to resume review:", err);
    }
  };

  // Pause review
  const handlePauseReview = async () => {
    try {
      await pauseReview();
    } catch (err) {
      console.error("Failed to pause review:", err);
    }
  };

  // Complete current step
  const handleCompleteStep = async (data?: unknown) => {
    try {
      if (currentSession) {
        await completeReviewStep(
          currentStep.id,
          data as Record<string, unknown> | undefined
        );

        if (currentStepIndex < totalSteps - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          // Complete entire review
          await completeReview(
            (stepData.reflection as { notes?: string })?.notes
          );
          setIsStarted(false);
          onComplete?.();
        }
      }
    } catch (err) {
      console.error("Failed to complete step:", err);
    }
  };

  // Go to previous step
  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Cancel review
  const handleCancelReview = async () => {
    try {
      await abandonReview();
      setIsStarted(false);
      onClose?.();
    } catch (err) {
      console.error("Failed to cancel review:", err);
    }
  };

  // Update step data
  const updateStepData = (stepId: string, data: unknown) => {
    setStepData((prev) => ({
      ...prev,
      [stepId]: {
        ...((prev[stepId] as Record<string, unknown>) || {}),
        ...((data as Record<string, unknown>) || {}),
      },
    }));
  };

  // Mark task as completed/deferred
  const handleTaskAction = async (
    task: Task,
    action: "complete" | "defer" | "reschedule"
  ) => {
    try {
      switch (action) {
        case "complete":
          await updateTask(task.id, {
            status: "completed",
            completed_at: new Date().toISOString(),
          });
          break;
        case "defer":
          await updateTask(task.id, {
            due_date: new Date(Date.now() + 86400000)
              .toISOString()
              .split("T")[0], // Tomorrow
          });
          break;
        case "reschedule":
          // Could open a date picker here
          break;
      }

      // Reload review data
      await loadDailyReviewData();
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  if (!isStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Daily Review</CardTitle>
                <CardDescription>
                  Quick 5-10 minute check-in with your GTD system
                </CardDescription>
              </div>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Review overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DAILY_REVIEW_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="p-1.5 bg-white rounded border">
                    <Icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {step.description}
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {step.timeEstimate}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Coaching Tip */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 text-sm">
                  Daily Review Benefits
                </h4>
                <p className="text-blue-700 text-sm mt-1">
                  Regular daily reviews help you stay on top of commitments,
                  make quick course corrections, and maintain trust in your GTD
                  system. Consistency is more important than perfection.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Maybe Later
            </Button>
            <Button onClick={handleStartReview} disabled={loading}>
              Start Daily Review
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isPaused) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Pause className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <CardTitle>Review Paused</CardTitle>
                <CardDescription>
                  You can resume your daily review anytime
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Progress: Step {currentStepIndex + 1} of {totalSteps}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(currentStepIndex / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleCancelReview}>
              Cancel Review
            </Button>
            <Button onClick={handleResumeReview}>
              <Play className="h-4 w-4 mr-2" />
              Resume Review
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {React.createElement(currentStep.icon, {
                className: "h-6 w-6 text-blue-600",
              })}
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {currentStep.title}
                <Badge variant="outline">
                  {currentStepIndex + 1} of {totalSteps}
                </Badge>
              </CardTitle>
              <CardDescription>{currentStep.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handlePauseReview}>
              <Pause className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancelReview}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step content */}
        {currentStep.id === "welcome" && (
          <WelcomeStep
            data={stepData.welcome}
            onDataChange={(data) => updateStepData("welcome", data)}
            onNext={() => handleCompleteStep(stepData.welcome)}
          />
        )}

        {currentStep.id === "calendar_check" && (
          <CalendarCheckStep
            data={stepData.calendar_check}
            onDataChange={(data) => updateStepData("calendar_check", data)}
            onNext={() => handleCompleteStep(stepData.calendar_check)}
          />
        )}

        {currentStep.id === "task_triage" && (
          <TaskTriageStep
            reviewData={dailyReviewData}
            data={stepData.task_triage}
            onDataChange={(data) => updateStepData("task_triage", data)}
            onTaskAction={handleTaskAction}
            onNext={() => handleCompleteStep(stepData.task_triage)}
          />
        )}

        {currentStep.id === "waiting_for_review" && (
          <WaitingForReviewStep
            reviewData={dailyReviewData}
            data={stepData.waiting_for_review}
            onDataChange={(data) => updateStepData("waiting_for_review", data)}
            onTaskAction={handleTaskAction}
            onNext={() => handleCompleteStep(stepData.waiting_for_review)}
          />
        )}

        {currentStep.id === "planning" && (
          <PlanningStep
            data={stepData.planning}
            onDataChange={(data) => updateStepData("planning", data)}
            onNext={() => handleCompleteStep(stepData.planning)}
          />
        )}

        {currentStep.id === "reflection" && (
          <ReflectionStep
            data={stepData.reflection}
            onDataChange={(data) => updateStepData("reflection", data)}
            onNext={() => handleCompleteStep(stepData.reflection)}
          />
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            disabled={currentStepIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="text-sm text-gray-500 self-center">
            Estimated time: {currentStep.timeEstimate}
          </div>

          {/* Next button is rendered by each step component */}
        </div>
      </CardContent>
    </Card>
  );
}

// Individual step components
function WelcomeStep({
  onNext,
}: {
  data: unknown;
  onDataChange: (data: unknown) => void;
  onNext: () => void;
}) {
  return (
    <div className="text-center space-y-4">
      <div className="py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Ready for your daily review?
        </h3>
        <p className="text-gray-600">
          This will take about 5-10 minutes to check in with your GTD system and
          prepare for a productive day.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-left">
            <h4 className="font-medium text-blue-900 text-sm">
              Today&apos;s Focus
            </h4>
            <p className="text-blue-700 text-sm mt-1">
              Remember: The goal isn&apos;t to complete everything, but to make
              conscious choices about what matters most today.
            </p>
          </div>
        </div>
      </div>

      <Button onClick={onNext} className="w-full">
        Let&apos;s Begin
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}

function CalendarCheckStep({
  data,
  onDataChange,
  onNext,
}: {
  data: unknown;
  onDataChange: (data: unknown) => void;
  onNext: () => void;
}) {
  const [calendarReviewed, setCalendarReviewed] = useState(
    (data as { calendarReviewed?: boolean })?.calendarReviewed || false
  );
  const [conflicts, setConflicts] = useState(
    (data as { conflicts?: string })?.conflicts || ""
  );

  const handleNext = () => {
    onDataChange({ calendarReviewed, conflicts });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Review Today&apos;s Calendar
        </h3>
        <p className="text-gray-600 mb-4">
          Check your calendar for appointments, meetings, and hard commitments.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900 text-sm">
                Calendar Integration
              </h4>
              <p className="text-yellow-700 text-sm mt-1">
                Open your calendar app to review today&apos;s schedule. Note any
                conflicts or preparation needed for meetings.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="calendar-reviewed"
            checked={calendarReviewed}
            onChange={(e) => setCalendarReviewed(e.target.checked)}
            className="rounded border-gray-300"
          />
          <Label htmlFor="calendar-reviewed">
            I&apos;ve reviewed my calendar for today
          </Label>
        </div>

        <div>
          <Label htmlFor="conflicts">Any conflicts or notes?</Label>
          <Textarea
            id="conflicts"
            placeholder="Note any scheduling conflicts, preparation needed, or other calendar-related items..."
            value={conflicts}
            onChange={(e) => setConflicts(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <Button
        onClick={handleNext}
        disabled={!calendarReviewed}
        className="w-full"
      >
        Continue to Task Review
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}

function TaskTriageStep({
  reviewData,
  data,
  onDataChange,
  onTaskAction,
  onNext,
}: {
  reviewData: DailyReviewData | null;
  data: unknown;
  onDataChange: (data: unknown) => void;
  onTaskAction: (
    task: Task,
    action: "complete" | "defer" | "reschedule"
  ) => void;
  onNext: () => void;
}) {
  const todaysTasks = reviewData?.todaysTasks || [];
  const overdueTasks = reviewData?.overdueTasks || [];
  const [reviewedTaskIds, setReviewedTaskIds] = useState<string[]>(
    (data as { reviewedTaskIds?: string[] })?.reviewedTaskIds || []
  );

  const markTaskReviewed = (taskId: string) => {
    const updated = [...reviewedTaskIds, taskId];
    setReviewedTaskIds(updated);
    onDataChange({ reviewedTaskIds: updated });
  };

  const allTasksReviewed = [...todaysTasks, ...overdueTasks].every((task) =>
    reviewedTaskIds.includes(task.id)
  );

  const handleNext = () => {
    onDataChange({ reviewedTaskIds });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Task Triage</h3>
        <p className="text-gray-600 mb-4">
          Review your tasks for today and handle any overdue items.
        </p>
      </div>

      {overdueTasks.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Overdue Tasks ({overdueTasks.length})
          </h4>
          {overdueTasks.map((task) => (
            <TaskReviewCard
              key={task.id}
              task={task}
              isReviewed={reviewedTaskIds.includes(task.id)}
              onMarkReviewed={() => markTaskReviewed(task.id)}
              onTaskAction={onTaskAction}
              isOverdue={true}
            />
          ))}
        </div>
      )}

      {todaysTasks.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Today&apos;s Tasks ({todaysTasks.length})
          </h4>
          {todaysTasks.map((task) => (
            <TaskReviewCard
              key={task.id}
              task={task}
              isReviewed={reviewedTaskIds.includes(task.id)}
              onMarkReviewed={() => markTaskReviewed(task.id)}
              onTaskAction={onTaskAction}
            />
          ))}
        </div>
      )}

      {todaysTasks.length === 0 && overdueTasks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle2 className="h-8 w-8 mx-auto mb-2" />
          <p>No tasks scheduled for today. Great job staying organized!</p>
        </div>
      )}

      <Button
        onClick={handleNext}
        disabled={!allTasksReviewed}
        className="w-full"
      >
        Continue to Waiting For
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}

function TaskReviewCard({
  task,
  isReviewed,
  onMarkReviewed,
  onTaskAction,
  isOverdue = false,
}: {
  task: Task;
  isReviewed: boolean;
  onMarkReviewed: () => void;
  onTaskAction: (
    task: Task,
    action: "complete" | "defer" | "reschedule"
  ) => void;
  isOverdue?: boolean;
}) {
  return (
    <Card
      className={`${isOverdue ? "border-red-200 bg-red-50" : ""} ${isReviewed ? "opacity-75" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h5 className="font-medium text-gray-900">{task.title}</h5>
            {task.description && (
              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
            )}
            {task.due_date && (
              <p
                className={`text-xs mt-2 ${isOverdue ? "text-red-600" : "text-gray-500"}`}
              >
                Due: {new Date(task.due_date).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 ml-4">
            {!isReviewed && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onTaskAction(task, "complete");
                    onMarkReviewed();
                  }}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onTaskAction(task, "defer");
                    onMarkReviewed();
                  }}
                >
                  Defer
                </Button>
                <Button size="sm" variant="outline" onClick={onMarkReviewed}>
                  Skip
                </Button>
              </>
            )}
            {isReviewed && <Badge variant="secondary">Reviewed</Badge>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WaitingForReviewStep({
  reviewData,
  data,
  onDataChange,
  onNext,
}: {
  reviewData: DailyReviewData | null;
  data: unknown;
  onDataChange: (data: unknown) => void;
  onTaskAction: (
    task: Task,
    action: "complete" | "defer" | "reschedule"
  ) => void;
  onNext: () => void;
}) {
  const waitingForItems = reviewData?.waitingForItems || [];
  const [reviewedItemIds, setReviewedItemIds] = useState<string[]>(
    (data as { reviewedItemIds?: string[] })?.reviewedItemIds || []
  );

  const markItemReviewed = (itemId: string) => {
    const updated = [...reviewedItemIds, itemId];
    setReviewedItemIds(updated);
    onDataChange({ reviewedItemIds: updated });
  };

  const allItemsReviewed = waitingForItems.every((item) =>
    reviewedItemIds.includes(item.id)
  );

  const handleNext = () => {
    onDataChange({ reviewedItemIds });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Waiting For Review
        </h3>
        <p className="text-gray-600 mb-4">
          Check on items you&apos;re waiting for from other people.
        </p>
      </div>

      {waitingForItems.length > 0 ? (
        <div className="space-y-3">
          {waitingForItems.map((item) => (
            <Card
              key={item.id}
              className={reviewedItemIds.includes(item.id) ? "opacity-75" : ""}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-gray-900">{item.title}</h5>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {item.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Waiting since:{" "}
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {!reviewedItemIds.includes(item.id) && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Could add follow-up logic here
                            markItemReviewed(item.id);
                          }}
                        >
                          Follow Up
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markItemReviewed(item.id)}
                        >
                          Still Waiting
                        </Button>
                      </>
                    )}
                    {reviewedItemIds.includes(item.id) && (
                      <Badge variant="secondary">Reviewed</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Clock className="h-8 w-8 mx-auto mb-2" />
          <p>No items in your waiting for list. Excellent!</p>
        </div>
      )}

      <Button
        onClick={handleNext}
        disabled={!allItemsReviewed}
        className="w-full"
      >
        Continue to Planning
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}

function PlanningStep({
  data,
  onDataChange,
  onNext,
}: {
  data: unknown;
  onDataChange: (data: unknown) => void;
  onNext: () => void;
}) {
  const [tomorrowsPlan, setTomorrowsPlan] = useState(
    (data as { tomorrowsPlan?: string })?.tomorrowsPlan || ""
  );
  const [priorities, setPriorities] = useState(
    (data as { priorities?: string })?.priorities || ""
  );

  const handleNext = () => {
    onDataChange({ tomorrowsPlan, priorities });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Tomorrow Planning
        </h3>
        <p className="text-gray-600 mb-4">
          Set intentions and priorities for tomorrow.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="priorities">
            What are your top 3 priorities for tomorrow?
          </Label>
          <Textarea
            id="priorities"
            placeholder="1. Complete project proposal
2. Call client about requirements
3. Review team feedback"
            value={priorities}
            onChange={(e) => setPriorities(e.target.value)}
            className="mt-1"
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="tomorrows-plan">
            Any specific intentions or plans?
          </Label>
          <Textarea
            id="tomorrows-plan"
            placeholder="Focus on deep work in the morning, schedule calls for afternoon..."
            value={tomorrowsPlan}
            onChange={(e) => setTomorrowsPlan(e.target.value)}
            className="mt-1"
            rows={3}
          />
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Target className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-900 text-sm">Planning Tip</h4>
            <p className="text-green-700 text-sm mt-1">
              Keep it simple and realistic. It&apos;s better to accomplish 3
              important things than to plan 10 and feel overwhelmed.
            </p>
          </div>
        </div>
      </div>

      <Button onClick={handleNext} className="w-full">
        Continue to Reflection
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}

function ReflectionStep({
  data,
  onDataChange,
  onNext,
}: {
  data: unknown;
  onDataChange: (data: unknown) => void;
  onNext: () => void;
}) {
  const [notes, setNotes] = useState((data as { notes?: string })?.notes || "");
  const [wins, setWins] = useState((data as { wins?: string })?.wins || "");
  const [improvements, setImprovements] = useState(
    (data as { improvements?: string })?.improvements || ""
  );

  const handleNext = () => {
    onDataChange({ notes, wins, improvements });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Quick Reflection
        </h3>
        <p className="text-gray-600 mb-4">
          Take a moment to reflect on your day and note any insights.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="wins">What went well today? (optional)</Label>
          <Input
            id="wins"
            placeholder="Completed the presentation, good client call..."
            value={wins}
            onChange={(e) => setWins(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="improvements">
            What could be improved? (optional)
          </Label>
          <Input
            id="improvements"
            placeholder="Start earlier, better time blocking..."
            value={improvements}
            onChange={(e) => setImprovements(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="notes">Additional notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any other thoughts, insights, or reminders..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1"
            rows={3}
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 text-sm">
              Reflection Benefits
            </h4>
            <p className="text-blue-700 text-sm mt-1">
              Regular reflection helps you learn from experiences, celebrate
              progress, and continuously improve your productivity system.
            </p>
          </div>
        </div>
      </div>

      <Button onClick={handleNext} className="w-full">
        Complete Daily Review
        <CheckCircle2 className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}

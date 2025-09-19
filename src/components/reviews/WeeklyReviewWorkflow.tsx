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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
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
  Lightbulb,
  BookOpen,
  Coffee,
  X,
  Inbox,
  FolderOpen,
  Archive,
  TrendingUp,
  BarChart3,
  Zap,
} from "lucide-react";
import type {
  Task,
  Project,
  WeeklyReviewData,
  ReviewStepType,
} from "@/types/database";

interface WeeklyReviewWorkflowProps {
  onClose?: () => void;
  onComplete?: () => void;
}

const WEEKLY_REVIEW_STEPS: Array<{
  id: ReviewStepType;
  title: string;
  description: string;
  timeEstimate: string;
  icon: React.ComponentType<{ className?: string }>;
  required: boolean;
}> = [
  {
    id: "welcome",
    title: "Weekly Review Start",
    description: "Comprehensive system review and planning",
    timeEstimate: "2 min",
    icon: Coffee,
    required: true,
  },
  {
    id: "inbox_process",
    title: "Inbox Processing",
    description: "Get your inbox to zero",
    timeEstimate: "10-15 min",
    icon: Inbox,
    required: true,
  },
  {
    id: "project_review",
    title: "Project Review",
    description: "Review all active projects and outcomes",
    timeEstimate: "10-15 min",
    icon: FolderOpen,
    required: true,
  },
  {
    id: "calendar_check",
    title: "Calendar Review",
    description: "Review past week and upcoming commitments",
    timeEstimate: "5 min",
    icon: Calendar,
    required: true,
  },
  {
    id: "waiting_for_review",
    title: "Waiting For Review",
    description: "Review and follow up on delegated items",
    timeEstimate: "5 min",
    icon: Clock,
    required: true,
  },
  {
    id: "someday_review",
    title: "Someday/Maybe Review",
    description: "Review and activate someday items",
    timeEstimate: "5-10 min",
    icon: Archive,
    required: true,
  },
  {
    id: "planning",
    title: "Next Week Planning",
    description: "Set priorities and intentions",
    timeEstimate: "5-10 min",
    icon: Target,
    required: true,
  },
  {
    id: "reflection",
    title: "Weekly Reflection",
    description: "Insights and system improvements",
    timeEstimate: "5 min",
    icon: Lightbulb,
    required: false,
  },
];

export function WeeklyReviewWorkflow({
  onClose,
  onComplete,
}: WeeklyReviewWorkflowProps) {
  const {
    currentSession,
    weeklyReviewData,
    loading,
    startReview,
    pauseReview,
    resumeReview,
    completeReviewStep,
    completeReview,
    abandonReview,
    loadWeeklyReviewData,
  } = useReviews();

  const { updateTask } = useTasks();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepData, setStepData] = useState<Record<string, unknown>>({});
  const [isStarted, setIsStarted] = useState(false);

  const currentStep = WEEKLY_REVIEW_STEPS[currentStepIndex];
  const isPaused = currentSession?.status === "paused";
  const totalSteps = WEEKLY_REVIEW_STEPS.length;

  // Initialize or resume review
  useEffect(() => {
    if (currentSession && currentSession.type === "weekly") {
      setIsStarted(true);
      setCurrentStepIndex(currentSession.current_step);
      setStepData(currentSession.session_data || {});
    }
  }, [currentSession]);

  // Start review
  const handleStartReview = async () => {
    try {
      await startReview("weekly");
      setIsStarted(true);
    } catch (err) {
      console.error("Failed to start weekly review:", err);
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

  // Task actions
  const handleTaskAction = async (
    task: Task,
    action: string,
    data?: unknown
  ) => {
    try {
      switch (action) {
        case "complete":
          await updateTask(task.id, {
            status: "completed",
            completed_at: new Date().toISOString(),
          });
          break;
        case "convert_to_next_action":
          await updateTask(task.id, { status: "next_action" });
          break;
        case "convert_to_project":
          await updateTask(task.id, { status: "project" });
          break;
        case "defer_to_someday":
          await updateTask(task.id, { status: "someday" });
          break;
        case "delete":
          // Implementation would depend on your delete strategy
          break;
        case "update_project":
          if ((data as { project_id?: string })?.project_id) {
            await updateTask(task.id, {
              project_id: (data as { project_id: string }).project_id,
            });
          }
          break;
      }

      // Reload review data
      await loadWeeklyReviewData();
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  if (!isStarted) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle>Weekly Review</CardTitle>
                <CardDescription>
                  Comprehensive 30-60 minute review of your GTD system
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
          {/* Weekly review overview */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">
              Weekly Review Process
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {WEEKLY_REVIEW_STEPS.map((step) => {
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
          </div>

          {/* Current system stats */}
          {weeklyReviewData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {weeklyReviewData.inboxItems.length}
                </div>
                <div className="text-sm text-blue-700">Inbox Items</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {weeklyReviewData.allProjects.length}
                </div>
                <div className="text-sm text-purple-700">Active Projects</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {weeklyReviewData.somedayItems.length}
                </div>
                <div className="text-sm text-gray-700">Someday Items</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {weeklyReviewData.completedThisWeek.length}
                </div>
                <div className="text-sm text-green-700">
                  Completed This Week
                </div>
              </div>
            </div>
          )}

          {/* AI Coaching Tip */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-purple-900 text-sm">
                  Weekly Review Benefits
                </h4>
                <p className="text-purple-700 text-sm mt-1">
                  The weekly review is the backbone of GTD. It ensures nothing
                  falls through the cracks, keeps projects moving forward, and
                  maintains your trust in the system. Block distraction-free
                  time for best results.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Maybe Later
            </Button>
            <Button onClick={handleStartReview} disabled={loading}>
              Start Weekly Review
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
                <CardTitle>Weekly Review Paused</CardTitle>
                <CardDescription>
                  You can resume your weekly review anytime
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
            <Progress
              value={(currentStepIndex / totalSteps) * 100}
              className="mb-6"
            />
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
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              {React.createElement(currentStep.icon, {
                className: "h-6 w-6 text-purple-600",
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
        <Progress value={((currentStepIndex + 1) / totalSteps) * 100} />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step content */}
        {currentStep.id === "welcome" && (
          <WeeklyWelcomeStep
            reviewData={weeklyReviewData}
            data={stepData.welcome}
            onDataChange={(data) => updateStepData("welcome", data)}
            onNext={() => handleCompleteStep(stepData.welcome)}
          />
        )}

        {currentStep.id === "inbox_process" && (
          <InboxProcessingStep
            reviewData={weeklyReviewData}
            data={stepData.inbox_process}
            onDataChange={(data) => updateStepData("inbox_process", data)}
            onTaskAction={handleTaskAction}
            onNext={() => handleCompleteStep(stepData.inbox_process)}
          />
        )}

        {currentStep.id === "project_review" && (
          <ProjectReviewStep
            reviewData={weeklyReviewData}
            data={stepData.project_review}
            onDataChange={(data) => updateStepData("project_review", data)}
            onTaskAction={handleTaskAction}
            onNext={() => handleCompleteStep(stepData.project_review)}
          />
        )}

        {currentStep.id === "calendar_check" && (
          <WeeklyCalendarStep
            data={stepData.calendar_check}
            onDataChange={(data) => updateStepData("calendar_check", data)}
            onNext={() => handleCompleteStep(stepData.calendar_check)}
          />
        )}

        {currentStep.id === "waiting_for_review" && (
          <WeeklyWaitingForStep
            reviewData={weeklyReviewData}
            data={stepData.waiting_for_review}
            onDataChange={(data) => updateStepData("waiting_for_review", data)}
            onTaskAction={handleTaskAction}
            onNext={() => handleCompleteStep(stepData.waiting_for_review)}
          />
        )}

        {currentStep.id === "someday_review" && (
          <SomedayReviewStep
            reviewData={weeklyReviewData}
            data={stepData.someday_review}
            onDataChange={(data) => updateStepData("someday_review", data)}
            onTaskAction={handleTaskAction}
            onNext={() => handleCompleteStep(stepData.someday_review)}
          />
        )}

        {currentStep.id === "planning" && (
          <WeeklyPlanningStep
            reviewData={weeklyReviewData}
            data={stepData.planning}
            onDataChange={(data) => updateStepData("planning", data)}
            onNext={() => handleCompleteStep(stepData.planning)}
          />
        )}

        {currentStep.id === "reflection" && (
          <WeeklyReflectionStep
            reviewData={weeklyReviewData}
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

// Individual step components for weekly review
function WeeklyWelcomeStep({
  reviewData,
  onNext,
}: {
  reviewData: WeeklyReviewData | null;
  data: unknown;
  onDataChange: (data: unknown) => void;
  onNext: () => void;
}) {
  const insights = reviewData?.insights;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Ready for your weekly review?
        </h3>
        <p className="text-gray-600">
          This comprehensive review will take 30-60 minutes to ensure your GTD
          system is current and trustworthy.
        </p>
      </div>

      {insights && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-green-600">
              {insights.tasksCompleted}
            </div>
            <div className="text-sm text-green-700">Tasks Completed</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <FolderOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-blue-600">
              {insights.projectsProgressed}
            </div>
            <div className="text-sm text-blue-700">Projects Active</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <BarChart3 className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-purple-600">
              {insights.avgTasksPerDay.toFixed(1)}
            </div>
            <div className="text-sm text-purple-700">Avg Tasks/Day</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Zap className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-orange-600">
              {insights.streakDays}
            </div>
            <div className="text-sm text-orange-700">Day Streak</div>
          </div>
        </div>
      )}

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-purple-900 text-sm">
              Weekly Review Purpose
            </h4>
            <p className="text-purple-700 text-sm mt-1">
              This review ensures you have a current, complete inventory of all
              your commitments and helps you make conscious decisions about what
              to focus on next.
            </p>
          </div>
        </div>
      </div>

      <Button onClick={onNext} className="w-full">
        Begin Weekly Review
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}

function InboxProcessingStep({
  reviewData,
  data,
  onDataChange,
  onTaskAction,
  onNext,
}: {
  reviewData: WeeklyReviewData | null;
  data: unknown;
  onDataChange: (data: unknown) => void;
  onTaskAction: (task: Task, action: string, data?: unknown) => void;
  onNext: () => void;
}) {
  const inboxItems = reviewData?.inboxItems || [];
  const [processedItems, setProcessedItems] = useState<string[]>(
    (data as { processedItems?: string[] })?.processedItems || []
  );

  const markItemProcessed = (itemId: string) => {
    const updated = [...processedItems, itemId];
    setProcessedItems(updated);
    onDataChange({ processedItems: updated });
  };

  const allItemsProcessed = inboxItems.every((item) =>
    processedItems.includes(item.id)
  );

  const handleNext = () => {
    onDataChange({ processedItems });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Inbox className="h-5 w-5" />
          Inbox Processing - Get to Zero
        </h3>
        <p className="text-gray-600 mb-4">
          Process each captured item: clarify what it is and what action is
          needed.
        </p>
      </div>

      {inboxItems.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              {processedItems.length} of {inboxItems.length} items processed
            </p>
            <Progress
              value={(processedItems.length / inboxItems.length) * 100}
              className="w-32"
            />
          </div>

          {inboxItems.map((item) => (
            <InboxItemCard
              key={item.id}
              item={item}
              isProcessed={processedItems.includes(item.id)}
              onMarkProcessed={() => markItemProcessed(item.id)}
              onTaskAction={onTaskAction}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
          <p>Inbox is empty! Excellent job staying organized.</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Target className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 text-sm">
              Processing Tips
            </h4>
            <ul className="text-blue-700 text-sm mt-1 space-y-1">
              <li>• Is it actionable? If no, delete or file for reference</li>
              <li>• If yes, what&apos;s the next action? Be specific</li>
              <li>• Will it take less than 2 minutes? Do it now</li>
              <li>• If longer, defer to appropriate list or calendar</li>
            </ul>
          </div>
        </div>
      </div>

      <Button
        onClick={handleNext}
        disabled={!allItemsProcessed}
        className="w-full"
      >
        Continue to Project Review
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}

function InboxItemCard({
  item,
  isProcessed,
  onMarkProcessed,
  onTaskAction,
}: {
  item: Task;
  isProcessed: boolean;
  onMarkProcessed: () => void;
  onTaskAction: (task: Task, action: string, data?: unknown) => void;
}) {
  const [showActions, setShowActions] = useState(false);

  if (isProcessed) {
    return (
      <Card className="opacity-75">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-medium text-gray-900">{item.title}</h5>
              {item.description && (
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              )}
            </div>
            <Badge variant="secondary">Processed</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-blue-200">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <h5 className="font-medium text-gray-900">{item.title}</h5>
            {item.description && (
              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Captured: {new Date(item.created_at).toLocaleDateString()}
            </p>
          </div>

          {!showActions ? (
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onTaskAction(item, "delete");
                  onMarkProcessed();
                }}
              >
                Delete
              </Button>
              <Button size="sm" onClick={() => setShowActions(true)}>
                Process Item
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">
                What action is needed?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onTaskAction(item, "convert_to_next_action");
                    onMarkProcessed();
                  }}
                >
                  Make Next Action
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onTaskAction(item, "convert_to_project");
                    onMarkProcessed();
                  }}
                >
                  Convert to Project
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onTaskAction(item, "defer_to_someday");
                    onMarkProcessed();
                  }}
                >
                  Someday/Maybe
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onTaskAction(item, "complete");
                    onMarkProcessed();
                  }}
                >
                  Complete Now
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowActions(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectReviewStep({
  reviewData,
  data,
  onDataChange,
  onTaskAction,
  onNext,
}: {
  reviewData: WeeklyReviewData | null;
  data: unknown;
  onDataChange: (data: unknown) => void;
  onTaskAction: (task: Task, action: string, data?: unknown) => void;
  onNext: () => void;
}) {
  const projects = reviewData?.allProjects || [];
  const [reviewedProjects, setReviewedProjects] = useState<string[]>(
    (data as { reviewedProjects?: string[] })?.reviewedProjects || []
  );

  const markProjectReviewed = (projectId: string) => {
    const updated = [...reviewedProjects, projectId];
    setReviewedProjects(updated);
    onDataChange({ reviewedProjects: updated });
  };

  const allProjectsReviewed = projects.every((project) =>
    reviewedProjects.includes(project.id)
  );

  const handleNext = () => {
    onDataChange({ reviewedProjects });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Project Review
        </h3>
        <p className="text-gray-600 mb-4">
          Review each active project to ensure it has a clear next action.
        </p>
      </div>

      {projects.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              {reviewedProjects.length} of {projects.length} projects reviewed
            </p>
            <Progress
              value={(reviewedProjects.length / projects.length) * 100}
              className="w-32"
            />
          </div>

          {projects.map((project) => (
            <ProjectReviewCard
              key={project.id}
              project={project}
              isReviewed={reviewedProjects.includes(project.id)}
              onMarkReviewed={() => markProjectReviewed(project.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <FolderOpen className="h-8 w-8 mx-auto mb-2" />
          <p>No active projects. Consider what outcomes you want to achieve.</p>
        </div>
      )}

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-900 text-sm">
              Project Review Questions
            </h4>
            <ul className="text-green-700 text-sm mt-1 space-y-1">
              <li>• Is this project still relevant and active?</li>
              <li>• What is the successful outcome?</li>
              <li>• What&apos;s the next action to move it forward?</li>
              <li>• Are there any dependencies or waiting-for items?</li>
            </ul>
          </div>
        </div>
      </div>

      <Button
        onClick={handleNext}
        disabled={!allProjectsReviewed}
        className="w-full"
      >
        Continue to Calendar Review
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}

function ProjectReviewCard({
  project,
  isReviewed,
  onMarkReviewed,
}: {
  project: Project;
  isReviewed: boolean;
  onMarkReviewed: () => void;
}) {
  const [notes, setNotes] = useState("");

  return (
    <Card className={isReviewed ? "opacity-75" : "border-2 border-purple-200"}>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <h5 className="font-medium text-gray-900">{project.name}</h5>
            {project.description && (
              <p className="text-sm text-gray-600 mt-1">
                {project.description}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Created: {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>

          {!isReviewed && (
            <div className="space-y-3">
              <Textarea
                placeholder="Notes about project status, next actions needed, or changes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
              <div className="flex justify-between">
                <Button variant="outline" size="sm">
                  Need Next Action
                </Button>
                <Button size="sm" onClick={onMarkReviewed}>
                  Mark Reviewed
                </Button>
              </div>
            </div>
          )}

          {isReviewed && <Badge variant="secondary">Reviewed</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}

// Placeholder implementations for remaining steps
function WeeklyCalendarStep({
  data,
  onDataChange,
  onNext,
}: {
  data: unknown;
  onDataChange: (data: unknown) => void;
  onNext: () => void;
}) {
  const [pastWeekReviewed, setPastWeekReviewed] = useState(
    (data as { pastWeekReviewed?: boolean })?.pastWeekReviewed || false
  );
  const [upcomingReviewed, setUpcomingReviewed] = useState(
    (data as { upcomingReviewed?: boolean })?.upcomingReviewed || false
  );

  const handleNext = () => {
    onDataChange({ pastWeekReviewed, upcomingReviewed });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Calendar Review
        </h3>
        <p className="text-gray-600 mb-4">
          Review the past week and upcoming commitments.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="past-week"
            checked={pastWeekReviewed}
            onCheckedChange={(checked) => setPastWeekReviewed(checked === true)}
          />
          <Label htmlFor="past-week">
            Reviewed past week&apos;s appointments and outcomes
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="upcoming"
            checked={upcomingReviewed}
            onCheckedChange={(checked) => setUpcomingReviewed(checked === true)}
          />
          <Label htmlFor="upcoming">
            Reviewed upcoming week&apos;s commitments and preparation needed
          </Label>
        </div>
      </div>

      <Button
        onClick={handleNext}
        disabled={!pastWeekReviewed || !upcomingReviewed}
        className="w-full"
      >
        Continue to Waiting For
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}

function WeeklyWaitingForStep({
  reviewData,
  data,
  onDataChange,
  onTaskAction,
  onNext,
}: {
  reviewData: WeeklyReviewData | null;
  data: unknown;
  onDataChange: (data: unknown) => void;
  onTaskAction: (task: Task, action: string, data?: unknown) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Waiting For Review
        </h3>
        <p className="text-gray-600 mb-4">
          Review items you&apos;re waiting on from others.
        </p>
      </div>

      <Button onClick={onNext} className="w-full">
        Continue to Someday Review
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}

function SomedayReviewStep({
  reviewData,
  data,
  onDataChange,
  onTaskAction,
  onNext,
}: {
  reviewData: WeeklyReviewData | null;
  data: unknown;
  onDataChange: (data: unknown) => void;
  onTaskAction: (task: Task, action: string, data?: unknown) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Someday/Maybe Review
        </h3>
        <p className="text-gray-600 mb-4">
          Review and potentially activate someday items.
        </p>
      </div>

      <Button onClick={onNext} className="w-full">
        Continue to Planning
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}

function WeeklyPlanningStep({
  reviewData,
  data,
  onDataChange,
  onNext,
}: {
  reviewData: WeeklyReviewData | null;
  data: unknown;
  onDataChange: (data: unknown) => void;
  onNext: () => void;
}) {
  const [weeklyGoals, setWeeklyGoals] = useState(
    (data as { weeklyGoals?: string })?.weeklyGoals || ""
  );

  const handleNext = () => {
    onDataChange({ weeklyGoals });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Next Week Planning
        </h3>
        <p className="text-gray-600 mb-4">
          Set intentions and priorities for the coming week.
        </p>
      </div>

      <div>
        <Label htmlFor="weekly-goals">Key outcomes for next week</Label>
        <Textarea
          id="weekly-goals"
          placeholder="What are the most important outcomes you want to achieve next week?"
          value={weeklyGoals}
          onChange={(e) => setWeeklyGoals(e.target.value)}
          className="mt-1"
          rows={4}
        />
      </div>

      <Button onClick={handleNext} className="w-full">
        Continue to Reflection
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}

function WeeklyReflectionStep({
  reviewData,
  data,
  onDataChange,
  onNext,
}: {
  reviewData: WeeklyReviewData | null;
  data: unknown;
  onDataChange: (data: unknown) => void;
  onNext: () => void;
}) {
  const [reflectionNotes, setReflectionNotes] = useState(
    (data as { reflectionNotes?: string })?.reflectionNotes || ""
  );

  const handleNext = () => {
    onDataChange({ reflectionNotes });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Weekly Reflection
        </h3>
        <p className="text-gray-600 mb-4">
          Reflect on the week and note improvements.
        </p>
      </div>

      <div>
        <Label htmlFor="reflection">Insights and improvements</Label>
        <Textarea
          id="reflection"
          placeholder="What worked well? What could be improved? Any system adjustments needed?"
          value={reflectionNotes}
          onChange={(e) => setReflectionNotes(e.target.value)}
          className="mt-1"
          rows={4}
        />
      </div>

      <Button onClick={handleNext} className="w-full">
        Complete Weekly Review
        <CheckCircle2 className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}

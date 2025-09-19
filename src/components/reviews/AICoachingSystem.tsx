"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  Target,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import type {
  ReviewType,
  ReviewStepType,
  WeeklyInsights,
  DailyReviewData,
  WeeklyReviewData,
} from "@/types/database";

interface AICoachingSystemProps {
  reviewType: ReviewType;
  currentStep?: ReviewStepType;
  reviewData?: DailyReviewData | WeeklyReviewData;
  insights?: WeeklyInsights | null;
  onDismiss?: () => void;
  compact?: boolean;
}

interface CoachingPrompt {
  id: string;
  type: "tip" | "insight" | "encouragement" | "warning" | "suggestion";
  title: string;
  message: string;
  actionable?: boolean;
  priority: "high" | "medium" | "low";
  conditions?: string[];
}

const COACHING_PROMPTS: Record<
  ReviewType,
  Record<ReviewStepType | "general", CoachingPrompt[]>
> = {
  daily: {
    general: [
      {
        id: "daily_consistency",
        type: "encouragement",
        title: "Building Habits",
        message:
          "Daily reviews are like compound interest for productivity. Small, consistent actions lead to significant results over time.",
        priority: "medium",
      },
      {
        id: "daily_timing",
        type: "tip",
        title: "Optimal Timing",
        message:
          "Most people find daily reviews work best either first thing in the morning or at the end of the workday. Find your rhythm.",
        priority: "low",
      },
    ],
    welcome: [
      {
        id: "welcome_mindset",
        type: "tip",
        title: "Review Mindset",
        message:
          "Approach this review as a conversation with your future self. What would help you feel prepared and confident today?",
        priority: "medium",
      },
    ],
    calendar_check: [
      {
        id: "calendar_preparation",
        type: "tip",
        title: "Meeting Preparation",
        message:
          "For each meeting today, ask: What outcome do I want? What preparation is needed? What follow-up actions might emerge?",
        priority: "high",
      },
      {
        id: "time_blocking",
        type: "suggestion",
        title: "Time Blocking",
        message:
          "Consider blocking time for your most important tasks between meetings. Protect your focus time.",
        actionable: true,
        priority: "medium",
      },
    ],
    task_triage: [
      {
        id: "overdue_action",
        type: "warning",
        title: "Overdue Tasks",
        message:
          "Overdue tasks can create mental overhead. Be honest about what&apos;s still relevant and reschedule or delete outdated items.",
        priority: "high",
        conditions: ["has_overdue_tasks"],
      },
      {
        id: "context_batching",
        type: "tip",
        title: "Context Batching",
        message:
          "Group similar tasks together. Make all your calls at once, batch your errands, or dedicate blocks to computer work.",
        priority: "medium",
      },
    ],
    inbox_process: [
      {
        id: "inbox_zero",
        type: "tip",
        title: "Inbox Processing",
        message:
          "For each item in your inbox, decide: Is it actionable? If yes, will it take less than 2 minutes? If so, do it now.",
        priority: "high",
      },
    ],
    project_review: [
      {
        id: "project_progress",
        type: "tip",
        title: "Project Health Check",
        message:
          "For each project, ask: What&apos;s the next physical action required? Is this project still aligned with my priorities?",
        priority: "high",
      },
    ],
    someday_review: [
      {
        id: "someday_relevance",
        type: "tip",
        title: "Someday/Maybe Review",
        message:
          "Review your someday/maybe list periodically. Some items may become irrelevant, while others might be ready to become active projects.",
        priority: "medium",
      },
    ],
    waiting_for_review: [
      {
        id: "follow_up_timing",
        type: "tip",
        title: "Follow-up Strategy",
        message:
          "For items you&apos;re waiting on, set a specific follow-up date rather than just hoping. A gentle check-in shows professionalism.",
        priority: "high",
      },
    ],
    planning: [
      {
        id: "daily_planning",
        type: "tip",
        title: "Daily Planning",
        message:
          "Choose 3 key outcomes for today. Having clear priorities helps you stay focused when distractions arise.",
        priority: "high",
      },
    ],
    reflection: [
      {
        id: "daily_reflection",
        type: "insight",
        title: "Learning and Growth",
        message:
          "What went well today? What could be improved? Small daily improvements compound over time.",
        priority: "medium",
      },
    ],
    completion: [
      {
        id: "daily_completion",
        type: "encouragement",
        title: "Review Complete",
        message:
          "Well done! You&apos;ve invested in your future self by taking time to review and plan. This daily practice builds momentum.",
        priority: "high",
      },
    ],
  },
  weekly: {
    general: [
      {
        id: "weekly_importance",
        type: "insight",
        title: "Weekly Review Power",
        message:
          "David Allen calls the weekly review the &quot;backbone&quot; of GTD. It&apos;s where you regain control and perspective on all your commitments.",
        priority: "high",
      },
      {
        id: "weekly_environment",
        type: "tip",
        title: "Review Environment",
        message:
          "Find a quiet, distraction-free space for your weekly review. This is strategic thinking time, not operational task-doing time.",
        priority: "medium",
      },
    ],
    welcome: [
      {
        id: "weekly_mindset",
        type: "tip",
        title: "Strategic Perspective",
        message:
          "The weekly review is your chance to think strategically. Step back from the day-to-day and look at the bigger picture.",
        priority: "high",
      },
    ],
    inbox_process: [
      {
        id: "inbox_zero_goal",
        type: "tip",
        title: "Inbox Zero Mindset",
        message:
          "The goal isn&apos;t to do everything in your inbox, but to decide what everything means. Clarify, organize, then act.",
        priority: "high",
      },
      {
        id: "processing_speed",
        type: "tip",
        title: "Processing Efficiently",
        message:
          "Move quickly through inbox items. If you can&apos;t decide in 30 seconds, it probably needs more information or breaking down.",
        priority: "medium",
      },
      {
        id: "large_inbox",
        type: "suggestion",
        title: "Large Inbox Strategy",
        message:
          "If your inbox is overwhelming, process the most recent items first, then tackle older items in batches over several sessions.",
        priority: "high",
        conditions: ["large_inbox"],
      },
    ],
    project_review: [
      {
        id: "project_outcomes",
        type: "insight",
        title: "Outcome Clarity",
        message:
          "For each project, ask: &quot;What does success look like?&quot; and &quot;What&apos;s the next physical action needed?&quot; These two questions drive everything forward.",
        priority: "high",
      },
      {
        id: "stalled_projects",
        type: "warning",
        title: "Stalled Projects",
        message:
          "If a project hasn&apos;t moved in 2+ weeks, it either needs a clearer next action or should be moved to Someday/Maybe.",
        priority: "high",
        conditions: ["has_stalled_projects"],
      },
    ],
    task_triage: [
      {
        id: "weekly_task_review",
        type: "tip",
        title: "Task Review",
        message:
          "Review all your tasks. Are they still relevant? Do they have clear next actions? Update or delete as needed.",
        priority: "high",
      },
    ],
    calendar_check: [
      {
        id: "calendar_learning",
        type: "insight",
        title: "Calendar Insights",
        message:
          "Your past week&apos;s calendar tells a story. What did you learn about your time allocation? Where did you create the most value?",
        priority: "medium",
      },
    ],
    waiting_for_review: [
      {
        id: "waiting_for_discipline",
        type: "tip",
        title: "Waiting For Discipline",
        message:
          "The Waiting For list only works if you actually check it regularly. Set calendar reminders for important follow-ups.",
        priority: "high",
      },
    ],
    someday_review: [
      {
        id: "someday_activation",
        type: "tip",
        title: "Activating Someday Items",
        message:
          "Someday/Maybe isn&apos;t a dumping ground. Regularly ask: &quot;Is this still relevant?&quot; and &quot;Am I ready to commit to this now?&quot;",
        priority: "medium",
      },
      {
        id: "someday_pruning",
        type: "suggestion",
        title: "Pruning Someday Lists",
        message:
          "It&apos;s healthy to delete Someday items that no longer excite you. Your interests and priorities evolve.",
        actionable: true,
        priority: "low",
      },
    ],
    planning: [
      {
        id: "weekly_priorities",
        type: "insight",
        title: "Weekly Priorities",
        message:
          "What are the 3 most important outcomes you want to achieve next week? Everything else is supporting these priorities.",
        priority: "high",
      },
      {
        id: "energy_planning",
        type: "tip",
        title: "Energy Management",
        message:
          "Plan not just what you&apos;ll do, but when based on your energy patterns. Schedule demanding work during your peak hours.",
        priority: "medium",
      },
    ],
    reflection: [
      {
        id: "system_improvements",
        type: "insight",
        title: "System Evolution",
        message:
          "Your GTD system should evolve with you. What&apos;s working well? What friction points can you eliminate?",
        priority: "medium",
      },
    ],
    completion: [
      {
        id: "weekly_completion",
        type: "encouragement",
        title: "Weekly Review Complete",
        message:
          "Excellent! You&apos;ve completed your weekly review. You should feel more in control and clear about your priorities for the week ahead.",
        priority: "high",
      },
    ],
  },
};

export function AICoachingSystem({
  reviewType,
  currentStep,
  reviewData,
  insights,
  compact = false,
}: AICoachingSystemProps) {
  const [visiblePrompts, setVisiblePrompts] = useState<CoachingPrompt[]>([]);
  const [dismissedPrompts, setDismissedPrompts] = useState<string[]>([]);

  // Memoize prompt computation for performance
  const computedPrompts = useMemo(() => {
    const stepPrompts = currentStep
      ? COACHING_PROMPTS[reviewType][currentStep] || []
      : [];
    const generalPrompts = COACHING_PROMPTS[reviewType].general || [];

    const allPrompts = [...stepPrompts, ...generalPrompts];

    // Filter prompts based on conditions
    const relevantPrompts = allPrompts.filter((prompt) => {
      if (dismissedPrompts.includes(prompt.id)) return false;

      if (prompt.conditions) {
        return prompt.conditions.every((condition) =>
          checkCondition(condition, reviewData)
        );
      }

      return true;
    });

    // Sort by priority and take top prompts
    const sortedPrompts = relevantPrompts.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    return compact ? sortedPrompts.slice(0, 1) : sortedPrompts.slice(0, 3);
  }, [
    reviewType,
    currentStep,
    reviewData,
    dismissedPrompts,
    compact,
  ]);

  // Update visible prompts when computed prompts change
  useEffect(() => {
    setVisiblePrompts(computedPrompts);
  }, [computedPrompts]);

  const dismissPrompt = useCallback((promptId: string) => {
    setDismissedPrompts((prev) => [...prev, promptId]);
  }, []);

  if (visiblePrompts.length === 0) return null;

  if (compact) {
    const prompt = visiblePrompts[0];
    return (
      <CompactCoachingPrompt
        prompt={prompt}
        onDismiss={() => dismissPrompt(prompt.id)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {visiblePrompts.map((prompt) => (
        <CoachingPromptCard
          key={prompt.id}
          prompt={prompt}
          onDismiss={() => dismissPrompt(prompt.id)}
        />
      ))}
    </div>
  );
}

const CoachingPromptCard = React.memo(function CoachingPromptCard({
  prompt,
  onDismiss,
}: {
  prompt: CoachingPrompt;
  onDismiss: () => void;
}) {
  const getIcon = () => {
    switch (prompt.type) {
      case "tip":
        return Lightbulb;
      case "insight":
        return Sparkles;
      case "encouragement":
        return CheckCircle2;
      case "warning":
        return AlertTriangle;
      case "suggestion":
        return Target;
      default:
        return Info;
    }
  };

  const getColorClasses = () => {
    switch (prompt.type) {
      case "tip":
        return "border-blue-200 bg-blue-50 text-blue-700";
      case "insight":
        return "border-purple-200 bg-purple-50 text-purple-700";
      case "encouragement":
        return "border-green-200 bg-green-50 text-green-700";
      case "warning":
        return "border-yellow-200 bg-yellow-50 text-yellow-700";
      case "suggestion":
        return "border-orange-200 bg-orange-50 text-orange-700";
      default:
        return "border-gray-200 bg-gray-50 text-gray-700";
    }
  };

  const Icon = getIcon();
  const colorClasses = getColorClasses();

  return (
    <Card
      className={`border ${colorClasses.split(" ")[0]} ${colorClasses.split(" ")[1]}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg ${colorClasses.split(" ")[1]} border ${colorClasses.split(" ")[0]}`}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4
                className={`font-medium text-sm ${colorClasses.split(" ")[2]}`}
              >
                {prompt.title}
              </h4>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {prompt.type}
                </Badge>
                <Button variant="ghost" size="sm" onClick={onDismiss}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <p className={`text-sm mt-1 ${colorClasses.split(" ")[2]}`}>
              {prompt.message}
            </p>
            {prompt.actionable && (
              <div className="mt-3">
                <Button size="sm" variant="outline" className="text-xs">
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Apply This
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

const CompactCoachingPrompt = React.memo(function CompactCoachingPrompt({
  prompt,
  onDismiss,
}: {
  prompt: CoachingPrompt;
  onDismiss: () => void;
}) {
  const Icon =
    prompt.type === "tip"
      ? Lightbulb
      : prompt.type === "insight"
        ? Sparkles
        : prompt.type === "warning"
          ? AlertTriangle
          : Info;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex items-start gap-2">
        <Icon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-blue-900">{prompt.title}</p>
          <p className="text-xs text-blue-700 mt-1">{prompt.message}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onDismiss} className="p-1">
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
});

// Helper function to check conditions
function checkCondition(
  condition: string,
  reviewData: DailyReviewData | WeeklyReviewData | undefined
): boolean {
  switch (condition) {
    case "has_overdue_tasks":
      if (reviewData && "overdueTasks" in reviewData) {
        return (reviewData.overdueTasks?.length ?? 0) > 0;
      }
      return false;
    case "large_inbox":
      if (reviewData && "inboxItems" in reviewData) {
        return (reviewData.inboxItems?.length ?? 0) > 10;
      }
      return false;
    case "has_stalled_projects":
      // Could implement logic to detect stalled projects
      return false;
    default:
      return true;
  }
}

// Additional coaching components for specific contexts
export function ReviewCompletionCoaching({
  reviewType,
  duration,
  tasksReviewed,
}: {
  reviewType: ReviewType;
  duration: number;
  tasksReviewed: number;
  insights?: WeeklyInsights | null;
}) {
  const getCompletionMessage = () => {
    if (reviewType === "daily") {
      if (duration < 5) {
        return {
          title: "Quick and Efficient!",
          message:
            "You completed your daily review efficiently. Consistency beats perfection.",
          type: "encouragement" as const,
        };
      } else if (duration > 15) {
        return {
          title: "Thorough Review",
          message:
            "You took time for a thorough review. Consider if you can streamline future daily reviews.",
          type: "tip" as const,
        };
      }
    } else if (reviewType === "weekly") {
      if (duration < 30) {
        return {
          title: "Efficient Weekly Review",
          message:
            "Great job completing your weekly review efficiently while being thorough.",
          type: "encouragement" as const,
        };
      }
    }

    return {
      title: "Review Complete!",
      message:
        "Well done on completing your review. Your GTD system is now current and trustworthy.",
      type: "encouragement" as const,
    };
  };

  const message = getCompletionMessage();
  const Icon = message.type === "encouragement" ? CheckCircle2 : Lightbulb;

  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Icon className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-medium text-green-900">{message.title}</h3>
            <p className="text-sm text-green-700 mt-1">{message.message}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-green-600">
              <span>Duration: {duration} minutes</span>
              <span>Tasks reviewed: {tasksReviewed}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReviewReminder({
  type,
  lastReviewDate,
  streak,
  onStartReview,
}: {
  type: "daily" | "weekly";
  lastReviewDate?: string;
  streak: number;
  onStartReview: () => void;
}) {
  const daysSinceLastReview = lastReviewDate
    ? Math.floor(
        (Date.now() - new Date(lastReviewDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 999;

  const isOverdue =
    type === "daily" ? daysSinceLastReview >= 1 : daysSinceLastReview >= 7;

  const getMessage = () => {
    if (type === "daily") {
      if (daysSinceLastReview === 0) return "Daily review completed today!";
      if (daysSinceLastReview === 1) return "Time for your daily review";
      return `Daily review overdue by ${daysSinceLastReview} days`;
    } else {
      if (daysSinceLastReview < 7) return "Weekly review up to date";
      return `Weekly review overdue by ${daysSinceLastReview - 7} days`;
    }
  };

  if (!isOverdue) return null;

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-medium text-orange-900 capitalize">
                {type} Review Due
              </h3>
              <p className="text-sm text-orange-700">{getMessage()}</p>
              {streak > 0 && (
                <p className="text-xs text-orange-600 mt-1">
                  Don&apos;t break your {streak}-day streak!
                </p>
              )}
            </div>
          </div>
          <Button onClick={onStartReview} size="sm">
            Start Review
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

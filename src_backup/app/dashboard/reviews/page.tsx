"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DailyReviewWorkflow } from "@/components/reviews/DailyReviewWorkflow";
import { WeeklyReviewWorkflow } from "@/components/reviews/WeeklyReviewWorkflow";
import { ReviewAnalyticsDashboard } from "@/components/reviews/ReviewAnalyticsDashboard";
import {
  AICoachingSystem,
  ReviewReminder,
} from "@/components/reviews/AICoachingSystem";
import { useReviews } from "@/hooks/useReviews";
import {
  Calendar,
  BarChart3,
  Play,
  BookOpen,
  Target,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  Timer,
} from "lucide-react";
import type { ReviewType } from "@/types/database";

type ViewMode = "overview" | "daily_review" | "weekly_review" | "analytics";

function ReviewsContent() {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const {
    currentSession,
    recentReviews,
    isReviewing,
    getReviewStreak,
    getCompletionRate,
    startReview,
    loadReviewHistory,
  } = useReviews();

  const streak = getReviewStreak();
  const completionRate = getCompletionRate(7);

  // Load data on mount
  useEffect(() => {
    loadReviewHistory();
  }, [loadReviewHistory]);

  // Auto-navigate to active review if one exists
  useEffect(() => {
    if (currentSession) {
      if (currentSession.type === "daily") {
        setViewMode("daily_review");
      } else if (currentSession.type === "weekly") {
        setViewMode("weekly_review");
      }
    }
  }, [currentSession]);

  const handleStartReview = async (type: ReviewType) => {
    try {
      await startReview(type);
      setViewMode(type === "daily" ? "daily_review" : "weekly_review");
    } catch (err) {
      console.error("Failed to start review:", err);
    }
  };

  const handleReviewComplete = () => {
    setViewMode("overview");
    loadReviewHistory();
  };

  const getLastReviewDate = (type: ReviewType) => {
    return recentReviews.find((r) => r.type === type)?.completed_at;
  };

  if (viewMode === "daily_review") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setViewMode("overview")}
            className="mb-4"
          >
            ← Back to Reviews
          </Button>
        </div>
        <DailyReviewWorkflow
          onClose={() => setViewMode("overview")}
          onComplete={handleReviewComplete}
        />
      </div>
    );
  }

  if (viewMode === "weekly_review") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setViewMode("overview")}
            className="mb-4"
          >
            ← Back to Reviews
          </Button>
        </div>
        <WeeklyReviewWorkflow
          onClose={() => setViewMode("overview")}
          onComplete={handleReviewComplete}
        />
      </div>
    );
  }

  if (viewMode === "analytics") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setViewMode("overview")}
            className="mb-4"
          >
            ← Back to Reviews
          </Button>
        </div>
        <ReviewAnalyticsDashboard />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600 mt-2">
            Stay on top of your commitments with regular GTD reviews
          </p>
        </div>

        {/* Review reminders */}
        <div className="space-y-4">
          <ReviewReminder
            type="daily"
            lastReviewDate={getLastReviewDate("daily")}
            streak={streak}
            onStartReview={() => handleStartReview("daily")}
          />
          <ReviewReminder
            type="weekly"
            lastReviewDate={getLastReviewDate("weekly")}
            streak={streak}
            onStartReview={() => handleStartReview("weekly")}
          />
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Current Streak
                  </p>
                  <p className="text-2xl font-bold text-orange-600">{streak}</p>
                  <p className="text-xs text-gray-500">days</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-green-600">
                    {completionRate}%
                  </p>
                  <p className="text-xs text-gray-500">completion rate</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Reviews
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {recentReviews.length}
                  </p>
                  <p className="text-xs text-gray-500">completed</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Avg Duration
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {recentReviews.length > 0
                      ? Math.round(
                          recentReviews.reduce(
                            (sum, r) => sum + (r.duration_minutes || 0),
                            0
                          ) / recentReviews.length
                        )
                      : 0}
                  </p>
                  <p className="text-xs text-gray-500">minutes</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Timer className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Coaching Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            GTD Coaching
          </h2>
          <AICoachingSystem reviewType="daily" insights={null} />
        </div>

        {/* Review Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily Review Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Daily Review</CardTitle>
                    <CardDescription>
                      Quick 5-10 minute check-in
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline">5-10 min</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Review today&apos;s commitments, triage tasks, and plan for
                  tomorrow. Essential for staying on top of your daily workflow.
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Calendar check and preparation
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Task triage and prioritization
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Tomorrow planning
                  </div>
                </div>

                <Button
                  onClick={() => handleStartReview("daily")}
                  className="w-full group-hover:bg-blue-700"
                  disabled={isReviewing}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isReviewing && currentSession?.type === "daily"
                    ? "Resume Daily Review"
                    : "Start Daily Review"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Review Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>Weekly Review</CardTitle>
                    <CardDescription>
                      Comprehensive system review
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline">30-60 min</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  The backbone of GTD. Process your inbox, review projects, and
                  ensure your system is current and trustworthy.
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Inbox processing (get to zero)
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Complete project review
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Calendar and commitments
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Someday/Maybe review
                  </div>
                </div>

                <Button
                  onClick={() => handleStartReview("weekly")}
                  className="w-full group-hover:bg-purple-700"
                  disabled={isReviewing}
                  variant="secondary"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isReviewing && currentSession?.type === "weekly"
                    ? "Resume Weekly Review"
                    : "Start Weekly Review"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Review Analytics
                </CardTitle>
                <CardDescription>
                  Track your review habits and system health
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setViewMode("analytics")}
              >
                View Details
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ReviewAnalyticsDashboard compact={true} />
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        {recentReviews.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>Your latest review sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentReviews.slice(0, 5).map((review) => (
                  <div
                    key={review.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          review.type === "daily" ? "default" : "secondary"
                        }
                      >
                        {review.type}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(review.completed_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-600">
                          {review.duration_minutes
                            ? `${review.duration_minutes} minutes`
                            : "Duration not recorded"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {review.tasks_reviewed || 0} tasks reviewed
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* GTD Learning Resources */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-green-900 mb-2">
                  GTD Review Best Practices
                </h3>
                <div className="space-y-2 text-sm text-green-700">
                  <p>
                    • <strong>Daily reviews:</strong> Keep them short (5-10 min)
                    and focused on today&apos;s commitments
                  </p>
                  <p>
                    • <strong>Weekly reviews:</strong> Block distraction-free
                    time, aim for completeness over speed
                  </p>
                  <p>
                    • <strong>Consistency:</strong> Better to do quick reviews
                    regularly than perfect reviews occasionally
                  </p>
                  <p>
                    • <strong>Trust the system:</strong> Your GTD system only
                    works if you maintain it through reviews
                  </p>
                </div>
                <p className="text-xs text-green-600 mt-3 italic">
                  &quot;The Weekly Review is the backbone of the GTD
                  workflow.&quot; - David Allen
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <ReviewsContent />
      </div>
    </ProtectedRoute>
  );
}

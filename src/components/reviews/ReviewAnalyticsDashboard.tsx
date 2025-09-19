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
import { Progress } from "@/components/ui/progress";
import { useReviews } from "@/hooks/useReviews";
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  BarChart3,
  Target,
  Zap,
  Award,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
} from "lucide-react";
import type { ReviewMetrics, Review, WeeklyInsights } from "@/types/database";

interface ReviewAnalyticsDashboardProps {
  timeRange?: "week" | "month" | "quarter";
  compact?: boolean;
}

export function ReviewAnalyticsDashboard({
  compact = false,
}: ReviewAnalyticsDashboardProps) {
  const {
    recentReviews,
    metrics,
    loading,
    getReviewStreak,
    getCompletionRate,
    getWeeklyInsights,
    loadReviewHistory,
    loadMetrics,
  } = useReviews();

  const [selectedTimeRange, setSelectedTimeRange] = useState("month");

  // Load data based on time range
  useEffect(() => {
    const days =
      selectedTimeRange === "week"
        ? 7
        : selectedTimeRange === "month"
          ? 30
          : 90;
    loadMetrics(days);
    loadReviewHistory();
  }, [selectedTimeRange, loadMetrics, loadReviewHistory]);

  // Calculate analytics
  const streak = getReviewStreak();
  const completionRate = getCompletionRate(7); // Last 7 days
  const weeklyInsights = getWeeklyInsights();

  // Calculate trends and statistics
  const stats = calculateReviewStats(metrics, recentReviews);

  if (loading && metrics.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <CompactAnalyticsDashboard
        stats={stats}
        streak={streak}
        completionRate={completionRate}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with time range selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Review Analytics</h2>
          <p className="text-gray-600">
            Track your GTD review habits and system health
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(["week", "month", "quarter"] as const).map((range) => (
            <Button
              key={range}
              variant={selectedTimeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTimeRange(range)}
            >
              {range === "week"
                ? "7 days"
                : range === "month"
                  ? "30 days"
                  : "90 days"}
            </Button>
          ))}
        </div>
      </div>

      {/* Key metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Current Streak"
          value={streak}
          unit="days"
          icon={Zap}
          color="orange"
          description="Consecutive days with daily reviews"
          trend={streak > 0 ? "up" : "neutral"}
        />

        <MetricCard
          title="Completion Rate"
          value={completionRate}
          unit="%"
          icon={Target}
          color="green"
          description="Daily reviews completed this week"
          trend={
            completionRate >= 80
              ? "up"
              : completionRate >= 60
                ? "neutral"
                : "down"
          }
        />

        <MetricCard
          title="Total Reviews"
          value={stats.totalReviews}
          unit=""
          icon={CheckCircle2}
          color="blue"
          description={`Reviews completed in ${selectedTimeRange}`}
          trend={stats.reviewTrend}
        />

        <MetricCard
          title="Avg Duration"
          value={stats.avgTime}
          unit="min"
          icon={Clock}
          color="purple"
          description="Average review duration"
          trend={stats.durationTrend}
        />
      </div>

      {/* Review patterns and insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReviewPatternsCard reviews={recentReviews} />
        <SystemHealthCard metrics={metrics} insights={weeklyInsights} />
      </div>

      {/* Detailed breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ReviewTypeBreakdown reviews={recentReviews} />
        <ProductivityTrends metrics={metrics} />
        <GoalsAndStreaks streak={streak} completionRate={completionRate} />
      </div>

      {/* Recent reviews list */}
      <RecentReviewsList reviews={recentReviews.slice(0, 10)} />
    </div>
  );
}

function CompactAnalyticsDashboard({
  stats,
  streak,
  completionRate,
}: {
  stats: { totalReviews: number; avgTime: number };
  streak: number;
  completionRate: number;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Review Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{streak}</div>
            <div className="text-xs text-gray-600">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {completionRate}%
            </div>
            <div className="text-xs text-gray-600">This Week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalReviews}
            </div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  color,
  description,
  trend,
}: {
  title: string;
  value: number;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "orange" | "green" | "blue" | "purple";
  description: string;
  trend: "up" | "down" | "neutral";
}) {
  const colorClasses = {
    orange: "text-orange-600 bg-orange-100",
    green: "text-green-600 bg-green-100",
    blue: "text-blue-600 bg-blue-100",
    purple: "text-purple-600 bg-purple-100",
  };

  const TrendIcon =
    trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Minus;
  const trendColor =
    trend === "up"
      ? "text-green-500"
      : trend === "down"
        ? "text-red-500"
        : "text-gray-500";

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <div className="flex items-center gap-1">
                <p className="text-2xl font-bold text-gray-900">
                  {value}
                  <span className="text-lg font-normal text-gray-600">
                    {unit}
                  </span>
                </p>
                <TrendIcon className={`h-4 w-4 ${trendColor}`} />
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">{description}</p>
      </CardContent>
    </Card>
  );
}

function ReviewPatternsCard({ reviews }: { reviews: Review[] }) {
  // Calculate review patterns (time of day, day of week, etc.)
  const patterns = analyzeReviewPatterns(reviews);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Review Patterns
        </CardTitle>
        <CardDescription>When you typically complete reviews</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Best Review Day</span>
              <span className="font-medium">{patterns.bestDay}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>Preferred Time</span>
              <span className="font-medium">{patterns.preferredTime}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Consistency Score</span>
              <span className="font-medium">{patterns.consistencyScore}%</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Weekly Pattern</p>
            {patterns.weeklyBreakdown.map((day) => (
              <div key={day.name} className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{day.name}</span>
                <div className="flex items-center gap-2 flex-1 ml-3">
                  <Progress value={day.percentage} className="flex-1 h-2" />
                  <span className="text-xs text-gray-500 w-8">{day.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SystemHealthCard({
  metrics,
  insights,
}: {
  metrics: ReviewMetrics[];
  insights: WeeklyInsights | null;
}) {
  const healthScore = calculateSystemHealth(metrics, insights);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          System Health
        </CardTitle>
        <CardDescription>Overall GTD system performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div
              className={`text-3xl font-bold ${
                healthScore >= 80
                  ? "text-green-600"
                  : healthScore >= 60
                    ? "text-yellow-600"
                    : "text-red-600"
              }`}
            >
              {healthScore}%
            </div>
            <p className="text-sm text-gray-600">Health Score</p>
          </div>

          <div className="space-y-3">
            <HealthIndicator
              label="Review Consistency"
              score={insights?.streakDays || 0}
              maxScore={7}
              type="streak"
            />
            <HealthIndicator
              label="Task Completion"
              score={insights?.tasksCompleted || 0}
              maxScore={insights ? Math.max(insights.tasksCompleted, 20) : 20}
              type="tasks"
            />
            <HealthIndicator
              label="Project Progress"
              score={insights?.projectsProgressed || 0}
              maxScore={insights ? Math.max(insights.projectsProgressed, 5) : 5}
              type="projects"
            />
          </div>

          {healthScore < 60 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Improvement Needed
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Consider increasing review frequency and task completion
                    rates.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function HealthIndicator({
  label,
  score,
  maxScore,
  type,
}: {
  label: string;
  score: number;
  maxScore: number;
  type: "streak" | "tasks" | "projects";
}) {
  const percentage = Math.min((score / maxScore) * 100, 100);
  const color =
    percentage >= 80
      ? "bg-green-500"
      : percentage >= 60
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>
          {score}
          {type === "streak" ? "d" : ""}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${color} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ReviewTypeBreakdown({ reviews }: { reviews: Review[] }) {
  const breakdown = reviews.reduce(
    (acc, review) => {
      acc[review.type] = (acc[review.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const total = reviews.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Types</CardTitle>
        <CardDescription>Distribution of review types</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(breakdown).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between">
              <span className="text-sm capitalize">
                {type.replace("_", " ")}
              </span>
              <div className="flex items-center gap-2">
                <Progress value={(count / total) * 100} className="w-20 h-2" />
                <span className="text-sm text-gray-600 w-8">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ProductivityTrends({ metrics }: { metrics: ReviewMetrics[] }) {
  const trend =
    metrics.length > 1
      ? metrics[0].tasks_completed - metrics[metrics.length - 1].tasks_completed
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Productivity Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-gray-600"}`}
            >
              {trend > 0 ? "+" : ""}
              {trend}
            </div>
            <p className="text-sm text-gray-600">Tasks vs Previous Period</p>
          </div>

          <div className="space-y-2">
            {metrics.slice(0, 5).map((metric) => (
              <div key={metric.id} className="flex justify-between text-sm">
                <span>{new Date(metric.date).toLocaleDateString()}</span>
                <span>{metric.tasks_completed} tasks</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GoalsAndStreaks({
  streak,
  completionRate,
}: {
  streak: number;
  completionRate: number;
}) {
  const nextMilestone = getNextMilestone(streak);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Goals & Milestones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Next Milestone</span>
              <span className="font-medium">{nextMilestone} days</span>
            </div>
            <Progress value={(streak / nextMilestone) * 100} />
            <p className="text-xs text-gray-500 mt-1">
              {nextMilestone - streak} days to go
            </p>
          </div>

          <div className="space-y-2">
            <Achievement
              title="Consistent Reviewer"
              description="Complete 7 daily reviews in a row"
              completed={streak >= 7}
            />
            <Achievement
              title="Weekly Warrior"
              description="Maintain 80%+ completion rate"
              completed={completionRate >= 80}
            />
            <Achievement
              title="GTD Master"
              description="30-day review streak"
              completed={streak >= 30}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Achievement({
  title,
  description,
  completed,
}: {
  title: string;
  description: string;
  completed: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 p-2 rounded-lg ${completed ? "bg-green-50" : "bg-gray-50"}`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          completed ? "bg-green-500 text-white" : "bg-gray-300"
        }`}
      >
        {completed ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Clock className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function RecentReviewsList({ reviews }: { reviews: Review[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Reviews</CardTitle>
        <CardDescription>Your latest review sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div
                key={review.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant={review.type === "daily" ? "default" : "secondary"}
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
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-8 w-8 mx-auto mb-2" />
              <p>No reviews completed yet</p>
              <p className="text-sm">
                Start your first review to see analytics
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper functions
function calculateReviewStats(metrics: ReviewMetrics[], reviews: Review[]) {
  const totalReviews = reviews.length;
  const avgDuration =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.duration_minutes || 0), 0) /
        reviews.length
      : 0;

  return {
    totalReviews,
    avgTime: Math.round(avgDuration),
    reviewTrend: "neutral" as const, // Could calculate actual trend
    durationTrend: "neutral" as const,
  };
}

function analyzeReviewPatterns(reviews: Review[]) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const weeklyBreakdown = days.map((name, index) => {
    const count = reviews.filter(
      (r) => new Date(r.completed_at).getDay() === index
    ).length;
    return { name, count, percentage: (count / reviews.length) * 100 };
  });

  const bestDay = weeklyBreakdown.reduce((best, current) =>
    current.count > best.count ? current : best
  ).name;

  return {
    bestDay,
    preferredTime: "Morning", // Could calculate from actual times
    consistencyScore: 75, // Could calculate based on regularity
    weeklyBreakdown,
  };
}

function calculateSystemHealth(
  metrics: ReviewMetrics[],
  insights: WeeklyInsights | null
): number {
  if (!insights) return 50;

  const reviewConsistency = Math.min((insights.streakDays / 7) * 100, 100);
  const taskCompletion = Math.min((insights.avgTasksPerDay / 5) * 100, 100);
  const projectProgress = insights.projectsProgressed > 0 ? 100 : 50;

  return Math.round((reviewConsistency + taskCompletion + projectProgress) / 3);
}

function getNextMilestone(streak: number): number {
  const milestones = [7, 14, 30, 60, 90, 180, 365];
  return milestones.find((m) => m > streak) || streak + 30;
}

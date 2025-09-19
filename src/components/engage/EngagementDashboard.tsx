"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskActionButton } from "./TaskActionButton";
import type { TaskSuggestion, TaskAction } from "@/types/database";
import {
  CheckCircle2,
  Clock,
  Calendar,
  ArrowRight,
  Star,
  Zap,
  AlertTriangle,
  Phone,
  Monitor,
  Car,
  Home,
  Building,
  Globe,
  Battery,
  ZapOff,
  Timer,
  Target,
  TrendingUp,
} from "lucide-react";

interface EngagementDashboardProps {
  suggestions: TaskSuggestion[];
  onTaskSelect: (task: TaskSuggestion["task"]) => void;
  onTaskAction: (taskId: string, action: TaskAction) => Promise<void>;
  loading?: boolean;
  showScoring?: boolean;
  className?: string;
}

const contextIcons = {
  calls: Phone,
  computer: Monitor,
  errands: Car,
  home: Home,
  office: Building,
  anywhere: Globe,
};

const energyIcons = {
  high: Zap,
  medium: Battery,
  low: ZapOff,
};

const statusColors = {
  captured: "bg-info-light text-brand-navy",
  next_action: "bg-orange-100 text-orange-800",
  project: "bg-purple-100 text-purple-800",
  waiting_for: "bg-warning-light text-warning-dark",
  someday: "bg-gray-100 text-gray-800",
  completed: "bg-success-light text-success-dark",
};

function TaskCard({
  suggestion,
  onSelect,
  onAction,
  showScoring = true,
}: {
  suggestion: TaskSuggestion;
  onSelect: () => void;
  onAction: (action: TaskAction) => Promise<void>;
  showScoring?: boolean;
}) {
  const { task, score, reasons } = suggestion;
  const [isLoading, setIsLoading] = useState(false);

  const ContextIcon = task.context ? contextIcons[task.context] : null;
  const EnergyIcon = task.energy_level ? energyIcons[task.energy_level] : null;

  const handleAction = async (action: TaskAction) => {
    setIsLoading(true);
    try {
      await onAction(action);
    } finally {
      setIsLoading(false);
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date();
  const isDueToday =
    task.due_date &&
    new Date(task.due_date).toDateString() === new Date().toDateString();

  return (
    <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer relative">
      {showScoring && score > 75 && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-yellow-400 text-yellow-900 rounded-full p-1">
            <Star className="h-3 w-3 fill-current" />
          </div>
        </div>
      )}

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with status and score */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Badge className={statusColors[task.status]} variant="secondary">
                {task.status.replace("_", " ")}
              </Badge>
              {showScoring && (
                <Badge variant="outline" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {score}
                </Badge>
              )}
            </div>

            {(isOverdue || isDueToday) && (
              <div className="flex items-center gap-1">
                <Calendar
                  className={`h-4 w-4 ${isOverdue ? "text-red-500" : "text-orange-500"}`}
                />
                <span
                  className={`text-xs ${isOverdue ? "text-red-600" : "text-orange-600"}`}
                >
                  {isOverdue ? "Overdue" : "Due today"}
                </span>
              </div>
            )}
          </div>

          {/* Task title and description */}
          <div onClick={onSelect} className="space-y-2">
            <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {task.title}
            </h3>

            {task.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>

          {/* Task metadata */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {ContextIcon && (
              <div className="flex items-center gap-1">
                <ContextIcon className="h-3 w-3" />
                <span className="capitalize">{task.context}</span>
              </div>
            )}

            {EnergyIcon && (
              <div className="flex items-center gap-1">
                <EnergyIcon className="h-3 w-3" />
                <span className="capitalize">{task.energy_level}</span>
              </div>
            )}

            {task.estimated_duration && (
              <div className="flex items-center gap-1">
                <Timer className="h-3 w-3" />
                <span>{task.estimated_duration}</span>
              </div>
            )}

            {task.priority && task.priority <= 2 && (
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-orange-500" />
                <span>P{task.priority}</span>
              </div>
            )}
          </div>

          {/* Reasons (for suggestions) */}
          {showScoring && reasons.length > 0 && (
            <div className="text-xs text-green-700 bg-green-50 rounded px-2 py-1">
              <span className="font-medium">Why now:</span>{" "}
              {reasons.slice(0, 2).join(", ")}
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-1">
              <TaskActionButton
                task={task}
                action={{ type: "complete" }}
                onAction={handleAction}
                disabled={isLoading}
                size="sm"
                variant="ghost"
                icon={CheckCircle2}
                tooltip="Complete task"
              />

              <TaskActionButton
                task={task}
                action={{ type: "defer" }}
                onAction={handleAction}
                disabled={isLoading}
                size="sm"
                variant="ghost"
                icon={Clock}
                tooltip="Defer task"
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onSelect}
              className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Details
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function EngagementDashboard({
  suggestions,
  onTaskSelect,
  onTaskAction,
  loading = false,
  showScoring = true,
  className,
}: EngagementDashboardProps) {
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="flex gap-2">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-12">
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Target className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                No tasks found
              </h3>
              <p className="text-gray-600 mt-1">
                {showScoring
                  ? "No tasks match your current context. Try adjusting your filters or context settings."
                  : "No tasks match the current filters. Try adjusting your filter criteria."}
              </p>
            </div>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showScoring && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Target className="h-4 w-4" />
          <span>
            Showing {suggestions.length} personalized suggestions for your
            current context
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((suggestion) => (
          <TaskCard
            key={suggestion.task.id}
            suggestion={suggestion}
            onSelect={() => onTaskSelect(suggestion.task)}
            onAction={(action) => onTaskAction(suggestion.task.id, action)}
            showScoring={showScoring}
          />
        ))}
      </div>
    </div>
  );
}

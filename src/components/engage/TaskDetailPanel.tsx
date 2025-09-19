"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { TaskActionButton } from "./TaskActionButton";
import type { Task, TaskAction } from "@/types/database";
import {
  X,
  CheckCircle2,
  Clock,
  Users,
  Edit3,
  Trash2,
  Play,
  Calendar,
  FolderOpen,
  Tag,
  Phone,
  Monitor,
  Car,
  Home,
  Building,
  Globe,
  Zap,
  Battery,
  ZapOff,
  Timer,
  Save,
  RotateCcw,
} from "lucide-react";

interface TaskDetailPanelProps {
  task: Task;
  onClose: () => void;
  onAction: (taskId: string, action: TaskAction) => Promise<void>;
  onStartTimer: (taskId: string, duration?: number) => void;
  timerState: {
    isRunning: boolean;
    currentTaskId?: string;
  };
  className?: string;
}

const contextIcons = {
  calls: { icon: Phone, label: "Calls" },
  computer: { icon: Monitor, label: "Computer" },
  errands: { icon: Car, label: "Errands" },
  home: { icon: Home, label: "Home" },
  office: { icon: Building, label: "Office" },
  anywhere: { icon: Globe, label: "Anywhere" },
};

const energyIcons = {
  high: { icon: Zap, label: "High Energy", color: "text-success-dark" },
  medium: { icon: Battery, label: "Medium Energy", color: "text-warning-dark" },
  low: { icon: ZapOff, label: "Low Energy", color: "text-error-dark" },
};

const statusColors = {
  captured: "bg-info-light text-brand-navy",
  next_action: "bg-orange-100 text-orange-800",
  project: "bg-purple-100 text-purple-800",
  waiting_for: "bg-warning-light text-warning-dark",
  someday: "bg-gray-100 text-gray-800",
  completed: "bg-success-light text-success-dark",
};

const priorityColors: Record<number, string> = {
  1: "bg-red-100 text-red-800",
  2: "bg-orange-100 text-orange-800",
  3: "bg-yellow-100 text-yellow-800",
  4: "bg-info-light text-brand-navy",
  5: "bg-gray-100 text-gray-800",
};

export function TaskDetailPanel({
  task,
  onClose,
  onAction,
  onStartTimer,
  timerState,
  className,
}: TaskDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(task.notes || "");
  const [isLoading, setIsLoading] = useState(false);

  const ContextInfo = task.context ? contextIcons[task.context] : null;
  const EnergyInfo = task.energy_level ? energyIcons[task.energy_level] : null;

  const isOverdue = task.due_date && new Date(task.due_date) < new Date();
  const isDueToday =
    task.due_date &&
    new Date(task.due_date).toDateString() === new Date().toDateString();

  const isTimerRunning =
    timerState.isRunning && timerState.currentTaskId === task.id;

  const handleSaveNotes = async () => {
    setIsLoading(true);
    try {
      await onAction(task.id, {
        type: "update",
        data: { notes: editedNotes },
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: TaskAction) => {
    setIsLoading(true);
    try {
      await onAction(task.id, action);
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg pr-4">Task Details</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Task Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={statusColors[task.status]} variant="secondary">
              {task.status.replace("_", " ")}
            </Badge>

            {task.priority && (
              <Badge
                className={priorityColors[task.priority]}
                variant="secondary"
              >
                Priority {task.priority}
              </Badge>
            )}

            {(isOverdue || isDueToday) && (
              <Badge
                variant={isOverdue ? "destructive" : "secondary"}
                className="flex items-center gap-1"
              >
                <Calendar className="h-3 w-3" />
                {isOverdue ? "Overdue" : "Due today"}
              </Badge>
            )}
          </div>

          <h2 className="text-xl font-semibold text-gray-900 leading-tight">
            {task.title}
          </h2>

          {task.description && (
            <p className="text-gray-600">{task.description}</p>
          )}
        </div>

        {/* Task Metadata */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {ContextInfo && (
            <div className="flex items-center gap-2">
              <ContextInfo.icon className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">{ContextInfo.label}</span>
            </div>
          )}

          {EnergyInfo && (
            <div className="flex items-center gap-2">
              <EnergyInfo.icon className={`h-4 w-4 ${EnergyInfo.color}`} />
              <span className="text-gray-700">{EnergyInfo.label}</span>
            </div>
          )}

          {task.estimated_duration && (
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">{task.estimated_duration}</span>
            </div>
          )}

          {task.due_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            </div>
          )}

          {task.project_id && (
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">Part of project</span>
            </div>
          )}

          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-2 col-span-2">
              <Tag className="h-4 w-4 text-gray-500" />
              <div className="flex gap-1 flex-wrap">
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Timer Section */}
        {task.status === "next_action" && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Focus Timer</h4>
            <div className="flex gap-2">
              {!isTimerRunning ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => onStartTimer(task.id, 25)}
                    className="flex items-center gap-1"
                  >
                    <Play className="h-3 w-3" />
                    25 min
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStartTimer(task.id, 15)}
                    className="flex items-center gap-1"
                  >
                    <Play className="h-3 w-3" />
                    15 min
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStartTimer(task.id, 50)}
                    className="flex items-center gap-1"
                  >
                    <Play className="h-3 w-3" />
                    50 min
                  </Button>
                </>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  Timer running
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Notes Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Notes</h4>
            {!isEditing ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditedNotes(task.notes || "");
                    setIsEditing(false);
                  }}
                  disabled={isLoading}
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={isLoading}
                >
                  <Save className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {isEditing ? (
            <Textarea
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.target.value)}
              placeholder="Add notes about this task..."
              className="min-h-[100px]"
            />
          ) : (
            <div className="min-h-[60px] p-3 bg-gray-50 rounded-md">
              {task.notes ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {task.notes}
                </p>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No notes added yet
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Actions</h4>

          <div className="grid grid-cols-2 gap-2">
            <TaskActionButton
              task={task}
              action={{ type: "complete" }}
              onAction={handleAction}
              disabled={isLoading}
              icon={CheckCircle2}
              variant="default"
            >
              Complete
            </TaskActionButton>

            <TaskActionButton
              task={task}
              action={{ type: "defer" }}
              onAction={handleAction}
              disabled={isLoading}
              icon={Clock}
              variant="outline"
            >
              Defer
            </TaskActionButton>

            <TaskActionButton
              task={task}
              action={{ type: "delegate" }}
              onAction={handleAction}
              disabled={isLoading}
              icon={Users}
              variant="outline"
            >
              Delegate
            </TaskActionButton>

            <TaskActionButton
              task={task}
              action={{ type: "delete" }}
              onAction={handleAction}
              disabled={isLoading}
              icon={Trash2}
              variant="outline"
            >
              Delete
            </TaskActionButton>
          </div>
        </div>

        {/* Task Meta Info */}
        <div className="pt-4 border-t text-xs text-gray-500 space-y-1">
          <div>Created: {new Date(task.created_at).toLocaleString()}</div>
          <div>Updated: {new Date(task.updated_at).toLocaleString()}</div>
          {task.completed_at && (
            <div>Completed: {new Date(task.completed_at).toLocaleString()}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

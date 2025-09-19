"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  X,
  Plus,
  Tag,
  Phone,
  Monitor,
  Car,
  Home,
  Building,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjects } from "@/hooks/useProjects";
import type {
  Task,
  TaskStatus,
  TaskContext,
  TaskEnergyLevel,
  TaskDuration,
  UpdateTaskInput,
} from "@/types/database";

interface TaskEditModalProps {
  task?: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: UpdateTaskInput) => Promise<void>;
}

const contextIcons: Record<TaskContext, React.ElementType> = {
  calls: Phone,
  computer: Monitor,
  errands: Car,
  home: Home,
  office: Building,
  anywhere: Globe,
};

export function TaskEditModal({
  task,
  isOpen,
  onClose,
  onSave,
}: TaskEditModalProps) {
  const { projects } = useProjects();
  const [formData, setFormData] = useState<UpdateTaskInput>({});
  const [newTag, setNewTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        status: task.status,
        project_id: task.project_id || undefined,
        context: task.context || undefined,
        energy_level: task.energy_level || undefined,
        estimated_duration: task.estimated_duration || undefined,
        due_date: task.due_date || undefined,
        priority: task.priority || undefined,
        tags: task.tags || [],
        notes: task.notes || "",
      });
    } else {
      setFormData({});
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;

    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving task:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    if (!newTag.trim() || formData.tags?.includes(newTag.trim())) return;

    setFormData((prev) => ({
      ...prev,
      tags: [...(prev.tags || []), newTag.trim()],
    }));
    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setFormData((prev) => ({
      ...prev,
      due_date: date ? date.toISOString() : undefined,
    }));
    setShowCalendar(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No due date";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create Task"}</DialogTitle>
          <DialogDescription>
            {task
              ? "Update task details and organize according to GTD principles."
              : "Add a new task to your GTD system."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="What needs to be done?"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Additional details..."
              rows={3}
            />
          </div>

          {/* Status and Project Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || "captured"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: value as TaskStatus,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="captured">📥 Captured</SelectItem>
                  <SelectItem value="next_action">⚡ Next Action</SelectItem>
                  <SelectItem value="project">📁 Project</SelectItem>
                  <SelectItem value="waiting_for">⏳ Waiting For</SelectItem>
                  <SelectItem value="someday">💭 Someday/Maybe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select
                value={formData.project_id || "none"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    project_id: value === "none" ? undefined : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="No project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Context, Energy, Duration Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="context">Context</Label>
              <Select
                value={formData.context || "none"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    context:
                      value === "none" ? undefined : (value as TaskContext),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any context" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Any context</SelectItem>
                  {Object.entries(contextIcons).map(([context, Icon]) => (
                    <SelectItem key={context} value={context}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />@{context}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="energy">Energy Level</Label>
              <Select
                value={formData.energy_level || "none"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    energy_level:
                      value === "none" ? undefined : (value as TaskEnergyLevel),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any energy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Any energy</SelectItem>
                  <SelectItem value="high">🔥 High Energy</SelectItem>
                  <SelectItem value="medium">⚡ Medium Energy</SelectItem>
                  <SelectItem value="low">🌱 Low Energy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select
                value={formData.estimated_duration || "none"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    estimated_duration:
                      value === "none" ? undefined : (value as TaskDuration),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unknown" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unknown</SelectItem>
                  <SelectItem value="5min">⚡ 5 minutes</SelectItem>
                  <SelectItem value="15min">🏃 15 minutes</SelectItem>
                  <SelectItem value="30min">⏰ 30 minutes</SelectItem>
                  <SelectItem value="1hour">⏳ 1 hour</SelectItem>
                  <SelectItem value="2hour+">📅 2+ hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date and Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.due_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDate(formData.due_date)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      formData.due_date
                        ? new Date(formData.due_date)
                        : undefined
                    }
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                  <div className="p-3 border-t">
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => handleDateSelect(undefined)}
                    >
                      Clear date
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority?.toString() || "none"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: value === "none" ? undefined : parseInt(value),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Normal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Normal</SelectItem>
                  <SelectItem value="1">🔴 Urgent</SelectItem>
                  <SelectItem value="2">🟠 High</SelectItem>
                  <SelectItem value="3">🟡 Medium</SelectItem>
                  <SelectItem value="4">🔵 Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags?.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddTag())
                }
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Additional notes, reminders, or context..."
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !formData.title?.trim()}
            >
              {isSaving ? "Saving..." : task ? "Update Task" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

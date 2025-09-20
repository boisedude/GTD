"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  TaskContext,
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

const taskFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(500, "Title must be 500 characters or less"),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .optional(),
  status: z.enum([
    "captured",
    "next_action",
    "project",
    "waiting_for",
    "someday",
    "completed",
  ]),
  project_id: z.string().optional(),
  context: z
    .enum(["calls", "computer", "errands", "home", "office", "anywhere"])
    .optional(),
  energy_level: z.enum(["high", "medium", "low"]).optional(),
  estimated_duration: z
    .enum(["5min", "15min", "30min", "1hour", "2hour+"])
    .optional(),
  due_date: z.string().optional(),
  priority: z.number().min(1).max(4).optional(),
  tags: z.array(z.string()).optional(),
  notes: z
    .string()
    .max(2000, "Notes must be 2000 characters or less")
    .optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

export function TaskEditModal({
  task,
  isOpen,
  onClose,
  onSave,
}: TaskEditModalProps) {
  const { projects } = useProjects();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "captured",
      project_id: "",
      context: undefined,
      energy_level: undefined,
      estimated_duration: undefined,
      due_date: "",
      priority: undefined,
      tags: [],
      notes: "",
    },
  });

  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        status: task.status,
        project_id: task.project_id || "",
        context: task.context || undefined,
        energy_level: task.energy_level || undefined,
        estimated_duration: task.estimated_duration || undefined,
        due_date: task.due_date || "",
        priority: task.priority || undefined,
        tags: task.tags || [],
        notes: task.notes || "",
      });
    } else {
      form.reset();
    }
  }, [task, form]);

  const onSubmit = async (values: TaskFormValues) => {
    try {
      const taskData: UpdateTaskInput = {
        ...values,
        project_id: values.project_id || undefined,
        due_date: values.due_date || undefined,
        priority: values.priority || undefined,
      };
      await onSave(taskData);
      onClose();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const [newTag, setNewTag] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  const handleAddTag = (tagValue?: string) => {
    const currentTags = form.getValues("tags") || [];
    const tagToAdd = tagValue || newTag;
    if (!tagToAdd.trim() || currentTags.includes(tagToAdd.trim())) return;

    form.setValue("tags", [...currentTags, tagToAdd.trim()]);
    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="What needs to be done?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status and Project Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="captured">📥 Captured</SelectItem>
                        <SelectItem value="next_action">
                          ⚡ Next Action
                        </SelectItem>
                        <SelectItem value="project">📁 Project</SelectItem>
                        <SelectItem value="waiting_for">
                          ⏳ Waiting For
                        </SelectItem>
                        <SelectItem value="someday">
                          💭 Someday/Maybe
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="project_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? "" : value)
                      }
                      defaultValue={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="No project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No project</SelectItem>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Context, Energy, Duration Row */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="context"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Context</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? undefined : value)
                      }
                      defaultValue={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Any context" />
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="energy_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Energy Level</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? undefined : value)
                      }
                      defaultValue={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Any energy" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Any energy</SelectItem>
                        <SelectItem value="high">🔥 High Energy</SelectItem>
                        <SelectItem value="medium">⚡ Medium Energy</SelectItem>
                        <SelectItem value="low">🌱 Low Energy</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimated_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? undefined : value)
                      }
                      defaultValue={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Unknown" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Unknown</SelectItem>
                        <SelectItem value="5min">⚡ 5 minutes</SelectItem>
                        <SelectItem value="15min">🏃 15 minutes</SelectItem>
                        <SelectItem value="30min">⏰ 30 minutes</SelectItem>
                        <SelectItem value="1hour">⏳ 1 hour</SelectItem>
                        <SelectItem value="2hour+">📅 2+ hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Due Date and Priority Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formatDate(field.value)}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            field.onChange(date ? date.toISOString() : "");
                            setShowCalendar(false);
                          }}
                          initialFocus
                        />
                        <div className="p-3 border-t">
                          <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => {
                              field.onChange("");
                              setShowCalendar(false);
                            }}
                          >
                            Clear date
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? undefined : parseInt(value))
                      }
                      defaultValue={field.value?.toString() || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Normal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Normal</SelectItem>
                        <SelectItem value="1">🔴 Urgent</SelectItem>
                        <SelectItem value="2">🟠 High</SelectItem>
                        <SelectItem value="3">🟡 Medium</SelectItem>
                        <SelectItem value="4">🔵 Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {field.value?.map((tag) => (
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
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button type="button" variant="outline" onClick={() => handleAddTag()}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes, reminders, or context..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Saving..."
                  : task
                    ? "Update Task"
                    : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

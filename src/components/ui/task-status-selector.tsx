"use client";

import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Inbox,
  CheckSquare,
  Clock,
  Lightbulb,
  FolderOpen,
  Archive,
} from "lucide-react";
import type { TaskStatus } from "@/types/database";

interface TaskStatusSelectorProps {
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
  className?: string;
  showDescription?: boolean;
  layout?: "vertical" | "horizontal" | "grid";
  disabled?: boolean;
}

const statusOptions = [
  {
    value: "captured" as TaskStatus,
    label: "Inbox",
    description: "New items to be processed",
    icon: Inbox,
    color: "blue",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
    iconColor: "text-blue-600",
  },
  {
    value: "next_action" as TaskStatus,
    label: "Next Action",
    description: "Ready to be done immediately",
    icon: CheckSquare,
    color: "orange",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-700",
    iconColor: "text-orange-600",
  },
  {
    value: "project" as TaskStatus,
    label: "Project",
    description: "Multi-step outcome requiring multiple actions",
    icon: FolderOpen,
    color: "purple",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-700",
    iconColor: "text-purple-600",
  },
  {
    value: "waiting_for" as TaskStatus,
    label: "Waiting For",
    description: "Delegated or pending external action",
    icon: Clock,
    color: "yellow",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-700",
    iconColor: "text-yellow-600",
  },
  {
    value: "someday" as TaskStatus,
    label: "Someday/Maybe",
    description: "Future possibilities to review",
    icon: Lightbulb,
    color: "gray",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    textColor: "text-gray-700",
    iconColor: "text-gray-600",
  },
  {
    value: "completed" as TaskStatus,
    label: "Completed",
    description: "Done and archived",
    icon: Archive,
    color: "green",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
    iconColor: "text-green-600",
  },
];

export function TaskStatusSelector({
  value,
  onChange,
  className,
  showDescription = true,
  layout = "vertical",
  disabled = false,
}: TaskStatusSelectorProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(newValue) => onChange(newValue as TaskStatus)}
      className={cn("space-y-2", className)}
      disabled={disabled}
    >
      {layout === "grid" ? (
        <div className="grid grid-cols-2 gap-3">
          {statusOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = value === option.value;

            return (
              <div key={option.value} className="relative">
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="peer sr-only"
                  disabled={disabled}
                />
                <Label
                  htmlFor={option.value}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200",
                    "hover:shadow-md hover:scale-[1.02]",
                    "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
                    isSelected
                      ? cn(option.borderColor, option.bgColor, "shadow-md")
                      : "border-gray-200 bg-white hover:border-gray-300"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-6 w-6",
                      isSelected ? option.iconColor : "text-gray-400"
                    )}
                  />
                  <div className="text-center">
                    <div
                      className={cn(
                        "font-medium text-sm",
                        isSelected ? option.textColor : "text-gray-700"
                      )}
                    >
                      {option.label}
                    </div>
                    {showDescription && (
                      <div className="text-xs text-gray-500 mt-1">
                        {option.description}
                      </div>
                    )}
                  </div>
                </Label>
              </div>
            );
          })}
        </div>
      ) : layout === "horizontal" ? (
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = value === option.value;

            return (
              <div key={option.value} className="relative">
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="peer sr-only"
                  disabled={disabled}
                />
                <Label
                  htmlFor={option.value}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-all duration-200",
                    "hover:shadow-sm",
                    "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
                    isSelected
                      ? cn(option.borderColor, option.bgColor)
                      : "border-gray-200 bg-white hover:border-gray-300"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isSelected ? option.iconColor : "text-gray-400"
                    )}
                  />
                  <span
                    className={cn(
                      "font-medium text-sm",
                      isSelected ? option.textColor : "text-gray-700"
                    )}
                  >
                    {option.label}
                  </span>
                </Label>
              </div>
            );
          })}
        </div>
      ) : (
        // Vertical layout
        <div className="space-y-2">
          {statusOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = value === option.value;

            return (
              <div key={option.value} className="relative">
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="peer sr-only"
                  disabled={disabled}
                />
                <Label
                  htmlFor={option.value}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200",
                    "hover:shadow-sm",
                    "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
                    isSelected
                      ? cn(option.borderColor, option.bgColor)
                      : "border-gray-200 bg-white hover:border-gray-300"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 mt-0.5",
                      isSelected ? option.iconColor : "text-gray-400"
                    )}
                  />
                  <div className="flex-1">
                    <div
                      className={cn(
                        "font-medium text-sm",
                        isSelected ? option.textColor : "text-gray-700"
                      )}
                    >
                      {option.label}
                    </div>
                    {showDescription && (
                      <div className="text-xs text-gray-500 mt-1">
                        {option.description}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <Badge variant="secondary" className="text-xs">
                      Selected
                    </Badge>
                  )}
                </Label>
              </div>
            );
          })}
        </div>
      )}
    </RadioGroup>
  );
}

// Simplified version for quick status changes
interface QuickStatusSelectorProps {
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
  className?: string;
  disabled?: boolean;
  excludeCompleted?: boolean;
}

export function QuickStatusSelector({
  value,
  onChange,
  className,
  disabled = false,
  excludeCompleted = false,
}: QuickStatusSelectorProps) {
  const options = excludeCompleted
    ? statusOptions.filter((option) => option.value !== "completed")
    : statusOptions;

  return (
    <RadioGroup
      value={value}
      onValueChange={(newValue) => onChange(newValue as TaskStatus)}
      className={cn("flex flex-wrap gap-1", className)}
      disabled={disabled}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const isSelected = value === option.value;

        return (
          <div key={option.value} className="relative">
            <RadioGroupItem
              value={option.value}
              id={`quick-${option.value}`}
              className="peer sr-only"
              disabled={disabled}
            />
            <Label
              htmlFor={`quick-${option.value}`}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer transition-all duration-200",
                "hover:shadow-sm",
                "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
                isSelected
                  ? cn(option.bgColor, option.textColor, "shadow-sm")
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
              title={option.description}
            >
              <Icon className="h-3 w-3" />
              {option.label}
            </Label>
          </div>
        );
      })}
    </RadioGroup>
  );
}

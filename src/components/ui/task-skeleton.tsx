"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TaskSkeletonProps {
  compact?: boolean;
  className?: string;
}

export function TaskSkeleton({
  compact = false,
  className,
}: TaskSkeletonProps) {
  return (
    <Card
      className={cn(
        "border-l-4 border-l-brand-gray-200 animate-pulse",
        className
      )}
    >
      <CardContent className={cn("p-4", compact && "p-3")}>
        <div className="flex items-start gap-3">
          {/* Checkbox skeleton */}
          <Skeleton className="h-5 w-5 rounded-full mt-0.5" />

          {/* Content skeleton */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title skeleton */}
            <Skeleton className={cn("h-5 w-3/4", compact && "h-4")} />

            {/* Description skeleton (only for non-compact) */}
            {!compact && (
              <div className="space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            )}

            {/* Metadata skeleton */}
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-14" />
              {!compact && <Skeleton className="h-3 w-20" />}
            </div>
          </div>

          {/* Menu button skeleton */}
          <Skeleton className="h-6 w-6 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

interface TaskListSkeletonProps {
  count?: number;
  compact?: boolean;
  withHeader?: boolean;
  className?: string;
}

export function TaskListSkeleton({
  count = 5,
  compact = false,
  withHeader = false,
  className,
}: TaskListSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {withHeader && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>
          <Skeleton className="h-4 w-4" />
        </div>
      )}

      {Array.from({ length: count }).map((_, index) => (
        <TaskSkeleton key={index} compact={compact} />
      ))}
    </div>
  );
}

interface GTDListSkeletonProps {
  className?: string;
}

export function GTDListSkeleton({ className }: GTDListSkeletonProps) {
  return (
    <Card className={cn("min-h-[400px]", className)}>
      {/* Header skeleton */}
      <div className="p-6 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-8 rounded-full" />
            <Skeleton className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="px-6 pb-6">
        <TaskListSkeleton count={4} compact />
      </div>
    </Card>
  );
}

interface DashboardSkeletonProps {
  className?: string;
}

export function DashboardSkeleton({ className }: DashboardSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Controls skeleton */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Stats overview skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="border-l-4 border-l-brand-gray-200">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-6 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* GTD Lists Grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <GTDListSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

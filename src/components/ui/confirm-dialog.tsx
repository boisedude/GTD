"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { AlertTriangle, Trash2, RefreshCw } from "lucide-react";

interface ConfirmDialogProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "warning" | "default";
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const variantConfig = {
  destructive: {
    icon: Trash2,
    iconColor: "text-error",
    confirmVariant: "destructive" as const,
    title: "Delete Item",
    description:
      "This action cannot be undone. Are you sure you want to delete this item?",
    confirmText: "Delete",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-warning",
    confirmVariant: "default" as const,
    title: "Confirm Action",
    description: "Are you sure you want to continue with this action?",
    confirmText: "Continue",
  },
  default: {
    icon: RefreshCw,
    iconColor: "text-brand-teal",
    confirmVariant: "default" as const,
    title: "Confirm Action",
    description: "Are you sure you want to perform this action?",
    confirmText: "Confirm",
  },
};

export function ConfirmDialog({
  children,
  title,
  description,
  confirmText,
  cancelText = "Cancel",
  variant = "default",
  isLoading = false,
  onConfirm,
  onCancel,
  open,
  onOpenChange,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onOpenChange?.(false);
    } catch (error) {
      // Error should be handled by the parent component
      console.error("Confirm action failed:", error);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-md" role="alertdialog">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                variant === "destructive" && "bg-error/10",
                variant === "warning" && "bg-warning/10",
                variant === "default" && "bg-brand-teal/10"
              )}
              role="img"
              aria-label={`${variant} action icon`}
            >
              <Icon
                className={cn("h-5 w-5", config.iconColor)}
                aria-hidden="true"
              />
            </div>
            <AlertDialogTitle className="text-left">
              {title || config.title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            {description || config.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <AlertDialogCancel
            onClick={handleCancel}
            disabled={isLoading}
            className="mt-2 sm:mt-0"
            aria-label={`Cancel ${variant} action`}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              buttonVariants({ variant: config.confirmVariant }),
              "min-w-[100px]"
            )}
            aria-label={`Confirm ${variant} action`}
            aria-describedby={isLoading ? "confirm-loading" : undefined}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div
                  className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"
                  role="status"
                  aria-hidden="true"
                />
                <span id="confirm-loading">Processing...</span>
              </div>
            ) : (
              confirmText || config.confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Convenience components for common use cases
interface DeleteConfirmDialogProps {
  children: React.ReactNode;
  itemName?: string;
  itemType?: string;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DeleteConfirmDialog({
  children,
  itemName,
  itemType = "item",
  isLoading,
  onConfirm,
  open,
  onOpenChange,
}: DeleteConfirmDialogProps) {
  const description = itemName
    ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
    : `Are you sure you want to delete this ${itemType}? This action cannot be undone.`;

  return (
    <ConfirmDialog
      variant="destructive"
      title={`Delete ${itemType}`}
      description={description}
      confirmText="Delete"
      isLoading={isLoading}
      onConfirm={onConfirm}
      open={open}
      onOpenChange={onOpenChange}
    >
      {children}
    </ConfirmDialog>
  );
}

interface ArchiveConfirmDialogProps {
  children: React.ReactNode;
  itemName?: string;
  itemType?: string;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ArchiveConfirmDialog({
  children,
  itemName,
  itemType = "item",
  isLoading,
  onConfirm,
  open,
  onOpenChange,
}: ArchiveConfirmDialogProps) {
  const description = itemName
    ? `Are you sure you want to archive "${itemName}"? You can restore it later from the archive.`
    : `Are you sure you want to archive this ${itemType}? You can restore it later from the archive.`;

  return (
    <ConfirmDialog
      variant="warning"
      title={`Archive ${itemType}`}
      description={description}
      confirmText="Archive"
      isLoading={isLoading}
      onConfirm={onConfirm}
      open={open}
      onOpenChange={onOpenChange}
    >
      {children}
    </ConfirmDialog>
  );
}

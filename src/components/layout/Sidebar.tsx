"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Plus,
  BarChart3,
  Target,
  Inbox,
  CheckSquare,
  Clock,
  Lightbulb,
  FolderOpen,
  Archive,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GTDSidebarProps {
  taskCounts?: {
    captured: number;
    next_actions: number;
    waiting_for: number;
    someday: number;
    projects: number;
    completed: number;
  };
}

export function GTDSidebar({ taskCounts }: GTDSidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const { state } = useSidebar();

  if (!user) return null;

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname?.startsWith(path);
  };

  const mainNavItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      description: "Overview and quick stats",
    },
    {
      href: "/capture",
      label: "Capture",
      icon: Plus,
      description: "Add new tasks and ideas",
    },
  ];

  const gtdLists = [
    {
      href: "/organize?filter=captured",
      label: "Inbox",
      icon: Inbox,
      count: taskCounts?.captured,
      description: "Uncategorized items to process",
      priority: "high",
    },
    {
      href: "/organize?filter=next_action",
      label: "Next Actions",
      icon: CheckSquare,
      count: taskCounts?.next_actions,
      description: "Tasks ready to be done",
      priority: "high",
    },
    {
      href: "/organize?filter=waiting_for",
      label: "Waiting For",
      icon: Clock,
      count: taskCounts?.waiting_for,
      description: "Tasks waiting on others",
      priority: "medium",
    },
    {
      href: "/organize?filter=someday",
      label: "Someday/Maybe",
      icon: Lightbulb,
      count: taskCounts?.someday,
      description: "Future possibilities",
      priority: "low",
    },
    {
      href: "/organize?filter=project",
      label: "Projects",
      icon: FolderOpen,
      count: taskCounts?.projects,
      description: "Multi-step outcomes",
      priority: "medium",
    },
  ];

  const workflowItems = [
    {
      href: "/dashboard/reviews",
      label: "Reviews",
      icon: BarChart3,
      description: "Daily and weekly reviews",
    },
    {
      href: "/engage",
      label: "Engage",
      icon: Target,
      description: "Context-based task suggestions",
    },
    {
      href: "/organize?filter=completed",
      label: "Archive",
      icon: Archive,
      count: taskCounts?.completed,
      description: "Completed tasks",
    },
  ];

  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      role="navigation"
      aria-label="Main navigation sidebar"
    >
      <SidebarHeader className="border-b border-brand-gray-200">
        <div className="flex items-center gap-2 px-2 py-1">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-teal text-white"
            role="img"
            aria-label="Clarity Done logo"
          >
            <span className="text-sm font-bold" aria-hidden="true">
              CD
            </span>
          </div>
          {state === "expanded" && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-brand-navy">
                Clarity Done
              </span>
              <span className="text-xs text-brand-gray-600">
                Calm. Clear. Done.
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu role="list" aria-label="Main navigation links">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <SidebarMenuItem key={item.href} role="listitem">
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={
                        state === "collapsed" ? item.description : undefined
                      }
                    >
                      <Link
                        href={item.href}
                        aria-label={`${item.label}: ${item.description}`}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* GTD Lists */}
        <SidebarGroup>
          <SidebarGroupLabel>GTD Lists</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu
              role="list"
              aria-label="Getting Things Done task lists"
            >
              {gtdLists.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                const hasItems = item.count && item.count > 0;
                const countText = hasItems
                  ? ` (${item.count} items)`
                  : " (empty)";

                return (
                  <SidebarMenuItem key={item.href} role="listitem">
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={
                        state === "collapsed" ? item.description : undefined
                      }
                      className={cn(
                        hasItems &&
                          item.priority === "high" &&
                          "text-error hover:text-error",
                        hasItems &&
                          item.priority === "medium" &&
                          "text-warning hover:text-warning"
                      )}
                    >
                      <Link
                        href={item.href}
                        aria-label={`${item.label}: ${item.description}${countText}`}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        <span>{item.label}</span>
                        {hasItems && state === "expanded" && (
                          <Badge
                            variant={
                              item.priority === "high"
                                ? "destructive"
                                : item.priority === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                            className="ml-auto text-xs"
                            aria-label={`${item.count} items`}
                          >
                            {item.count}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Workflow */}
        <SidebarGroup>
          <SidebarGroupLabel>Workflow</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workflowItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={
                        state === "collapsed" ? item.description : undefined
                      }
                    >
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                        {item.count &&
                          item.count > 0 &&
                          state === "expanded" && (
                            <Badge
                              variant="secondary"
                              className="ml-auto text-xs"
                            >
                              {item.count}
                            </Badge>
                          )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-brand-gray-200">
        {state === "expanded" && (
          <div className="px-2 py-2">
            <p className="text-xs text-brand-gray-500 text-center">
              Getting Things Done inspired
            </p>
            <p className="text-xs text-brand-gray-400 text-center">
              Not affiliated with GTD®
            </p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

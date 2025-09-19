"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { UserMenu } from "@/components/auth/user-menu";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Plus,
  Settings,
  BarChart3,
  Target,
  Menu,
} from "lucide-react";
import { useState } from "react";

export function Header() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname?.startsWith(path);
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/capture", label: "Capture", icon: Plus },
    { href: "/organize", label: "Organize", icon: Settings },
    { href: "/dashboard/reviews", label: "Reviews", icon: BarChart3 },
    { href: "/engage", label: "Engage", icon: Target },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-gray-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-6">
          <Link
            href={user ? "/dashboard" : "/"}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200"
          >
            <span className="text-brand-xl font-bold text-brand-navy">
              Clarity Done
            </span>
          </Link>

          {user && (
            <>
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 text-brand-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg",
                        active
                          ? "text-brand-navy bg-brand-teal/10 border border-brand-teal/20"
                          : "text-brand-gray-700 hover:text-brand-navy hover:bg-brand-gray-100"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </>
          )}
        </div>

        {/* Auth Section */}
        <div className="flex items-center">
          {user ? (
            <UserMenu />
          ) : (
            <div className="flex items-center space-x-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {user && mobileMenuOpen && (
        <div className="md:hidden border-t border-brand-gray-200 bg-background shadow-lg">
          <nav className="container mx-auto px-4 py-2">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 text-brand-sm font-medium transition-all duration-200 px-3 py-3 rounded-lg",
                      active
                        ? "text-brand-navy bg-brand-teal/10 border border-brand-teal/20"
                        : "text-brand-gray-700 hover:text-brand-navy hover:bg-brand-gray-100"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

// Mobile navigation component
export function MobileNav() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname?.startsWith(path);
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/capture", label: "Capture", icon: Plus },
    { href: "/organize", label: "Organize", icon: Settings },
    { href: "/dashboard/reviews", label: "Reviews", icon: BarChart3 },
    { href: "/engage", label: "Engage", icon: Target },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 md:hidden border-t border-brand-gray-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 shadow-lg"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="container mx-auto px-2 py-1">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center h-14 px-2 py-2 text-brand-xs font-medium transition-all duration-200 rounded-lg",
                  active
                    ? "text-brand-navy bg-brand-teal/10 border border-brand-teal/20"
                    : "text-brand-gray-600 hover:text-brand-navy hover:bg-brand-gray-100"
                )}
                aria-label={`Go to ${item.label}`}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 mb-1",
                    active ? "text-brand-teal" : ""
                  )}
                />
                <span className="leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { UserMenu } from "@/components/auth/user-menu";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-6">
          <Link
            href={user ? "/dashboard" : "/"}
            className="flex items-center space-x-2"
          >
            <span className="text-xl font-bold text-gray-900">GTD App</span>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/capture"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Capture
              </Link>
              <Link
                href="/organize"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Organize
              </Link>
              <Link
                href="/dashboard/reviews"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Reviews
              </Link>
              <Link
                href="/engage"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Engage
              </Link>
            </nav>
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
    </header>
  );
}

// Mobile navigation component
export function MobileNav() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <nav className="md:hidden border-t bg-white" role="navigation" aria-label="Mobile navigation">
      <div className="container mx-auto px-2 py-1">
        <div className="grid grid-cols-5 gap-1">
          <Button asChild variant="ghost" size="sm" className="h-12 flex-col text-xs">
            <Link href="/dashboard">
              <span className="sr-only">Go to </span>Dashboard
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="h-12 flex-col text-xs">
            <Link href="/capture">
              <span className="sr-only">Go to </span>Capture
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="h-12 flex-col text-xs">
            <Link href="/organize">
              <span className="sr-only">Go to </span>Organize
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="h-12 flex-col text-xs">
            <Link href="/dashboard/reviews">
              <span className="sr-only">Go to </span>Reviews
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="h-12 flex-col text-xs">
            <Link href="/engage">
              <span className="sr-only">Go to </span>Engage
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}

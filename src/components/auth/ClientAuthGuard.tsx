"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface ClientAuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function ClientAuthGuard({ children, requireAuth = true }: ClientAuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      // Redirect to login with current path as redirect parameter
      const redirectPath = pathname !== "/" ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.push(`/auth/login${redirectPath}`);
    }
  }, [user, loading, requireAuth, router, pathname]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If auth is required but user is not authenticated, show nothing (redirect is handled in useEffect)
  if (requireAuth && !user) {
    return null;
  }

  // Render children
  return <>{children}</>;
}
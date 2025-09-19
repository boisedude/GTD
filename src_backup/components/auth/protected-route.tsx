"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !user) {
      // User needs to be authenticated but isn't
      const redirectPath = redirectTo || "/auth/login";
      const currentPath = pathname;

      // Add current path as redirect parameter
      const searchParams = new URLSearchParams();
      if (currentPath !== "/" && currentPath !== redirectPath) {
        searchParams.set("redirect", currentPath);
      }

      const redirectUrl = searchParams.toString()
        ? `${redirectPath}?${searchParams.toString()}`
        : redirectPath;

      router.push(redirectUrl);
      return;
    }

    if (!requireAuth && user) {
      // User is authenticated but shouldn't be (e.g., on login page)
      const redirectPath = redirectTo || "/dashboard";
      router.push(redirectPath);
      return;
    }
  }, [user, loading, requireAuth, router, pathname, redirectTo]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if auth requirements aren't met
  if (requireAuth && !user) {
    return null;
  }

  if (!requireAuth && user) {
    return null;
  }

  return <>{children}</>;
}

// Higher-order component for pages that require authentication
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: { redirectTo?: string }
) {
  const AuthenticatedComponent = (props: P) => {
    return (
      <ProtectedRoute requireAuth={true} redirectTo={options?.redirectTo}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;

  return AuthenticatedComponent;
}

// Higher-order component for pages that require NO authentication (like login)
export function withoutAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: { redirectTo?: string }
) {
  const UnauthenticatedComponent = (props: P) => {
    return (
      <ProtectedRoute requireAuth={false} redirectTo={options?.redirectTo}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  UnauthenticatedComponent.displayName = `withoutAuth(${Component.displayName || Component.name})`;

  return UnauthenticatedComponent;
}

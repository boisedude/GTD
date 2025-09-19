"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { CaptureContainer } from "@/components/capture/CaptureContainer";
import { OrganizationDashboard } from "@/components/gtd/OrganizationDashboard";

function DashboardContent() {
  const { isNewUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect new users to onboarding
    if (isNewUser) {
      router.push("/onboarding");
    }
  }, [isNewUser, router]);

  if (isNewUser) {
    return null; // Will redirect to onboarding
  }

  return (
    <div className="min-h-screen bg-brand-gray-50">
      {/* Header with integrated capture - Mobile optimized */}
      <div className="bg-background border-b border-brand-gray-200 sticky top-0 z-50 shadow-sm backdrop-blur-sm bg-background/95">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="py-3 sm:py-6">
            {/* Always-visible capture input - Mobile first sizing */}
            <CaptureContainer
              alwaysVisible={true}
              autoFocus={false}
              showStatus={true}
              className="max-w-full sm:max-w-2xl mx-auto"
            />
          </div>
        </div>
      </div>

      {/* Main Dashboard Content - Mobile optimized spacing */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <OrganizationDashboard />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

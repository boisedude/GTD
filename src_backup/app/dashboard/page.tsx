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
    <div className="min-h-screen bg-gray-50">
      {/* Header with integrated capture */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            {/* Always-visible capture input */}
            <CaptureContainer
              alwaysVisible={true}
              autoFocus={false}
              showStatus={true}
              className="max-w-2xl mx-auto"
            />
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

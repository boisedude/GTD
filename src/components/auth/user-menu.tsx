"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings, Loader2 } from "lucide-react";

interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className }: UserMenuProps) {
  const { user, signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      const { error } = await signOut();
      if (error) {
        console.error("Error signing out:", error.message);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center space-x-4">
        {/* User info */}
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user.email}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/settings")}
            className="hidden sm:inline-flex"
          >
            <Settings className="h-4 w-4" />
            <span className="ml-2">Settings</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 hidden sm:inline">Signing Out...</span>
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Sign Out</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Simplified logout button for mobile/compact views
export function LogoutButton() {
  const { signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      const { error } = await signOut();
      if (error) {
        console.error("Error signing out:", error.message);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      disabled={loggingOut}
      className="w-full justify-start"
    >
      {loggingOut ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Signing Out...
        </>
      ) : (
        <>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </>
      )}
    </Button>
  );
}

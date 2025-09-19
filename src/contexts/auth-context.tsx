"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithOtp: (email: string) => Promise<{ error: Error | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  isNewUser: boolean;
  setIsNewUser: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error.message);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error("Error in getSession:", error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Check if this is a new user (first sign in)
      if (event === "SIGNED_IN" && session?.user) {
        // Check if user profile exists or if this is their first login
        const signedUpAt = new Date(session.user.created_at);
        const now = new Date();
        const timeDiff = now.getTime() - signedUpAt.getTime();
        const hoursDiff = timeDiff / (1000 * 3600);

        // Consider user "new" if they signed up within the last hour
        if (hoursDiff < 1) {
          setIsNewUser(true);
        }
      }

      if (event === "SIGNED_OUT") {
        setIsNewUser(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signInWithOtp = async (email: string) => {
    try {
      setLoading(true);

      // Get the base URL for email redirect - only use window.location on client side
      const getBaseUrl = () => {
        if (typeof window !== 'undefined') {
          return window.location.origin;
        }
        // Fallback for SSR - use environment variable or default
        return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      };

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // Redirect to verification page after OTP is sent
          emailRedirectTo: `${getBaseUrl()}/auth/verify`,
        },
      });
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error | null };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error | null };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error | null };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signInWithOtp,
    verifyOtp,
    signOut,
    isNewUser,
    setIsNewUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

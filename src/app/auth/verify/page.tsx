"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Loader2, Mail, RefreshCw } from "lucide-react";

export default function VerifyPage() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const { verifyOtp, signInWithOtp, user } = useAuth();

  useEffect(() => {
    // Get email from session storage
    const storedEmail = sessionStorage.getItem("auth_email");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // Redirect to login if no email found
      router.push("/auth/login");
    }
  }, [router]);

  useEffect(() => {
    // Redirect if already authenticated
    if (user) {
      const redirectTo =
        sessionStorage.getItem("auth_redirect") || "/dashboard";
      sessionStorage.removeItem("auth_email");
      sessionStorage.removeItem("auth_redirect");
      router.push(redirectTo);
    }
  }, [user, router]);

  useEffect(() => {
    // Cooldown timer for resend button
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !email) return;

    setLoading(true);
    setError("");

    try {
      const { error } = await verifyOtp(email, otp);

      if (error) {
        setError(error.message);
      } else {
        // Success - user will be redirected by useEffect
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendCooldown > 0) return;

    setResending(true);
    setError("");

    try {
      const { error } = await signInWithOtp(email);

      if (error) {
        setError(error.message);
      } else {
        setResendCooldown(60); // 60 second cooldown
      }
    } catch {
      setError("Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const formatOtp = (value: string) => {
    // Remove any non-numeric characters and limit to 6 digits
    const numbers = value.replace(/\D/g, "").slice(0, 6);
    // Add spaces between groups of 3 digits for better readability
    return numbers.replace(/(\d{3})(\d{1,3})/, "$1 $2").trim();
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatOtp(e.target.value);
    setOtp(formatted);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        {/* Back to login link */}
        <Link
          href="/auth/login"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sign In
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Enter Verification Code</CardTitle>
            <CardDescription>We sent a 6-digit code to {email}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="otp" className="text-sm font-medium">
                  Verification Code
                </label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000 000"
                  value={otp}
                  onChange={handleOtpChange}
                  required
                  disabled={loading}
                  className="w-full text-center text-lg font-mono tracking-wider"
                  maxLength={7} // 6 digits + 1 space
                />
                <p className="text-xs text-gray-500">
                  Enter the 6-digit code from your email
                </p>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading || otp.replace(/\s/g, "").length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Didn&apos;t receive the code?
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResend}
                disabled={resending || resendCooldown > 0}
              >
                {resending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Resend Code
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Tips:</strong> Check your spam folder if you don&apos;t see
            the email. The code expires in 10 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Only show landing page to unauthenticated users
  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="max-w-4xl text-center space-y-12">
        <div className="space-y-6">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900">
            GTD App
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A productivity app inspired by David Allen&apos;s Getting Things
            Done methodology. Capture, clarify, organize, reflect, and engage
            with your tasks stress-free.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/auth/login">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6"
            >
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
          <p className="text-sm text-yellow-800">
            <strong>Disclaimer:</strong> This app is inspired by GTD principles
            but is not affiliated with or licensed by David Allen or GTD®.
          </p>
        </div>

        <div id="features" className="space-y-8">
          <h2 className="text-3xl font-bold text-gray-900">The GTD Workflow</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Capture</h3>
              <p className="text-sm text-gray-600">
                Collect everything that has your attention
              </p>
            </div>
            <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Clarify</h3>
              <p className="text-sm text-gray-600">
                Decide what each item means and what action is required
              </p>
            </div>
            <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-yellow-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Organize</h3>
              <p className="text-sm text-gray-600">
                Put items where they belong in your system
              </p>
            </div>
            <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-purple-600 font-bold">4</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Reflect</h3>
              <p className="text-sm text-gray-600">
                Review your system regularly to stay current
              </p>
            </div>
            <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-red-600 font-bold">5</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Engage</h3>
              <p className="text-sm text-gray-600">
                Take action with confidence and clarity
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Why Choose GTD App?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center space-y-3">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
              <h3 className="font-semibold">Fast Capture</h3>
              <p className="text-sm text-gray-600">
                Quickly capture thoughts and tasks in under 5 seconds
              </p>
            </div>
            <div className="text-center space-y-3">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
              <h3 className="font-semibold">Mobile First</h3>
              <p className="text-sm text-gray-600">
                Designed for thumb-friendly interactions on any device
              </p>
            </div>
            <div className="text-center space-y-3">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
              <h3 className="font-semibold">Privacy Focused</h3>
              <p className="text-sm text-gray-600">
                Your data is yours - secure and private by design
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/auth/login">
              Start Getting Things Done
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

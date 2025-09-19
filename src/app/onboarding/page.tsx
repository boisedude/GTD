"use client";

import { useState, useEffect } from "react";

// Client-side only to avoid SSR issues with auth
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, ArrowRight, Play } from "lucide-react";

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const { user, setIsNewUser } = useAuth();
  const router = useRouter();

  const steps = [
    {
      title: "Welcome to Clarity Done",
      description:
        "Calm. Clear. Done. Get organized and stress-free with the Getting Things Done methodology",
      content: (
        <div className="space-y-4">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-600">
              You&apos;ve successfully signed in! Let&apos;s get you set up with
              a quick introduction to how this app helps you capture, clarify,
              organize, reflect, and engage with your tasks.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "The GTD Workflow",
      description: "Understand the five core steps",
      content: (
        <div className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">1</span>
              </div>
              <div>
                <h4 className="font-medium">Capture</h4>
                <p className="text-sm text-gray-600">
                  Collect everything that has your attention
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">2</span>
              </div>
              <div>
                <h4 className="font-medium">Clarify</h4>
                <p className="text-sm text-gray-600">
                  Decide what each item means and what action is required
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">3</span>
              </div>
              <div>
                <h4 className="font-medium">Organize</h4>
                <p className="text-sm text-gray-600">
                  Put items where they belong in your system
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">4</span>
              </div>
              <div>
                <h4 className="font-medium">Reflect</h4>
                <p className="text-sm text-gray-600">
                  Review your system regularly to stay current
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">5</span>
              </div>
              <div>
                <h4 className="font-medium">Engage</h4>
                <p className="text-sm text-gray-600">
                  Take action with confidence and clarity
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Quick Capture",
      description: "Your most powerful tool for stress-free productivity",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            The capture input is always available at the top of your dashboard.
            Whenever something crosses your mind, quickly capture it here
            without worrying about organizing it right away.
          </p>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Quick Capture (Example)
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="What's on your mind?"
                  className="flex-1 px-3 py-2 border rounded-md bg-white"
                  disabled
                />
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  disabled
                >
                  Capture
                </button>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            This will be available on every page once you start using the app.
          </p>
        </div>
      ),
    },
    {
      title: "You're All Set!",
      description: "Ready to start your journey to clarity",
      content: (
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Play className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-gray-600">
            You&apos;re ready to start capturing, organizing, and getting things
            done! Head to your dashboard to begin.
          </p>
          <div className="bg-warning-light border border-warning rounded-lg p-4">
            <p className="text-sm text-warning-dark">
              <strong>Disclaimer:</strong> This app is inspired by GTD
              principles but is not affiliated with or licensed by David Allen
              or GTD®.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    // Mark user as no longer new
    setIsNewUser(false);
    // Redirect to dashboard
    router.push("/dashboard");
  };

  const handleSkip = () => {
    setIsNewUser(false);
    router.push("/dashboard");
  };

  useEffect(() => {
    if (!user && typeof window !== "undefined") {
      router.push("/auth/login");
    }
  }, [user, router]);

  if (!user) {
    return null; // Loading state or redirecting
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center space-x-2 mb-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index <= currentStep ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-8">{steps[currentStep].content}</div>

            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700"
              >
                Skip Tutorial
              </Button>

              <div className="flex space-x-2">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                  >
                    Previous
                  </Button>
                )}
                <Button onClick={handleNext}>
                  {currentStep === steps.length - 1 ? (
                    <>
                      Go to Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

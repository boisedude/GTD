"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Inbox, Target } from "lucide-react";

export default function CapturePage() {
  const [task, setTask] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;

    setIsCapturing(true);

    // Simulate task capture
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setTask("");
    setIsCapturing(false);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-navy mb-2">
          Quick Capture
        </h1>
        <p className="text-brand-gray-600">
          Capture tasks, ideas, and thoughts quickly. Sort them out later.
        </p>
      </div>

      {/* Quick Capture Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-brand-teal" />
            Capture New Item
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="What's on your mind? (e.g., 'Call dentist', 'Project idea: mobile app')"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                className="text-lg"
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={!task.trim() || isCapturing}
                className="flex items-center gap-2"
              >
                {isCapturing ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Inbox className="h-4 w-4" />
                )}
                {isCapturing ? "Capturing..." : "Capture"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setTask("")}
                disabled={!task.trim()}
              >
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Common Captures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setTask("Call ")}
            >
              📞 Call someone
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setTask("Email ")}
            >
              ✉️ Send email
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setTask("Buy ")}
            >
              🛒 Buy something
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setTask("Research ")}
            >
              🔍 Research topic
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Capture Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-brand-gray-600">
            <p>• Don&apos;t worry about organizing now - just capture</p>
            <p>
              • Be specific: &quot;Call dentist for appointment&quot; vs
              &quot;dentist&quot;
            </p>
            <p>• Include context when helpful</p>
            <p>• Trust the system - you&apos;ll organize later</p>
          </CardContent>
        </Card>
      </div>

      {/* Next Steps */}
      <Card className="bg-brand-teal-light border-brand-teal">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Target className="h-6 w-6 text-brand-teal-dark" />
            <div>
              <h3 className="font-semibold text-brand-navy">
                What&apos;s Next?
              </h3>
              <p className="text-sm text-brand-gray-700">
                After capturing, head to <strong>Organize</strong> to clarify
                your items into actionable tasks and projects.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

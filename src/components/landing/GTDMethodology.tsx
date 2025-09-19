"use client";

import { BRAND } from "@/lib/brand";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Inbox,
  Search,
  FolderOpen,
  RotateCcw,
  Target,
  ArrowRight,
} from "lucide-react";

const gtdSteps = [
  {
    icon: Inbox,
    title: "Capture",
    description:
      "Collect everything that has your attention in a trusted external system.",
    details: "Get it all out of your head and into a reliable capture tool.",
  },
  {
    icon: Search,
    title: "Clarify",
    description:
      "Process what each item means and what action, if any, is required.",
    details: "Transform vague thoughts into clear, actionable outcomes.",
  },
  {
    icon: FolderOpen,
    title: "Organize",
    description: "Put action reminders into appropriate categories and lists.",
    details: "Create a systematic structure that supports your workflow.",
  },
  {
    icon: RotateCcw,
    title: "Reflect",
    description: "Review your system regularly to maintain trust and control.",
    details:
      "Keep your system current and your mind clear through regular reviews.",
  },
  {
    icon: Target,
    title: "Engage",
    description: "Use your system to make confident choices about what to do.",
    details:
      "Focus on the right work at the right time with complete confidence.",
  },
];

export function GTDMethodology() {
  return (
    <section
      id="methodology"
      className="py-16 sm:py-24 bg-white dark:bg-slate-950"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 sm:text-4xl">
            The GTD Methodology
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-slate-600 dark:text-slate-400">
            Getting Things Done (GTD) is a proven productivity methodology that
            helps you achieve stress-free productivity by organizing your
            commitments and actions systematically.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {gtdSteps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <Card
                key={step.title}
                className="relative group hover:shadow-lg transition-shadow"
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/20">
                    <IconComponent className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-slate-600 dark:text-slate-400 mb-3">
                    {step.description}
                  </CardDescription>
                  <p className="text-sm text-slate-500 dark:text-slate-500">
                    {step.details}
                  </p>
                </CardContent>

                {/* Step number indicator */}
                <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white dark:bg-slate-100 dark:text-slate-900">
                  {index + 1}
                </div>

                {/* Arrow connector for larger screens */}
                {index < gtdSteps.length - 1 && (
                  <div className="hidden xl:block absolute -right-6 top-1/2 transform -translate-y-1/2 text-slate-300 dark:text-slate-600">
                    <ArrowRight className="h-6 w-6" />
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div className="mt-16 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400 italic">
            {BRAND.disclaimer}
          </p>
        </div>
      </div>
    </section>
  );
}

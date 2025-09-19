"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Zap,
  Brain,
  ListTodo,
  Calendar,
  Smartphone,
  Shield,
  Users,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Quick Capture",
    description:
      "Instantly capture thoughts, tasks, and ideas from anywhere. Your inbox is always ready to collect what's on your mind.",
  },
  {
    icon: Brain,
    title: "Smart Clarification",
    description:
      "Transform vague thoughts into clear, actionable items with guided prompts and intelligent suggestions.",
  },
  {
    icon: ListTodo,
    title: "GTD Lists",
    description:
      "Organize tasks into proper GTD contexts: Next Actions, Waiting For, Someday/Maybe, and Projects.",
  },
  {
    icon: Calendar,
    title: "Regular Reviews",
    description:
      "Stay on top of your system with structured daily and weekly review workflows that keep you in control.",
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description:
      "Designed mobile-first for quick capture and review on the go. Fast, responsive, and thumb-friendly.",
  },
  {
    icon: Shield,
    title: "Privacy Focused",
    description:
      "Your data stays private and secure. Built with privacy by design and full account deletion support.",
  },
];

const benefits = [
  {
    icon: Brain,
    title: "Stress-Free Mind",
    description: "Empty your mind of clutter and focus on what matters most.",
  },
  {
    icon: BarChart3,
    title: "Increased Productivity",
    description:
      "Complete more meaningful work with less stress and overwhelm.",
  },
  {
    icon: Users,
    title: "Better Focus",
    description: "Make confident decisions about what to work on next.",
  },
];

export function Features() {
  return (
    <section className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Features */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 sm:text-4xl">
            Everything You Need for GTD
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-slate-600 dark:text-slate-400">
            ClarityDone provides all the tools you need to implement the
            complete GTD workflow, designed for simplicity and effectiveness.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group hover:shadow-lg transition-shadow bg-white dark:bg-slate-800"
              >
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/20 group-hover:bg-teal-200 dark:group-hover:bg-teal-900/30 transition-colors">
                    <IconComponent className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
              Why Choose ClarityDone?
            </h3>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
              Experience the transformative power of a well-implemented GTD
              system.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {benefits.map((benefit) => {
              const IconComponent = benefit.icon;
              return (
                <div key={benefit.title} className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-white">
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    {benefit.title}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

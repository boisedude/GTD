"use client";

import { BRAND } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="relative py-12 sm:py-20 lg:py-32">
          <div className="text-center">
            {/* Logo placeholder - using brand name for now */}
            <div className="mb-6 sm:mb-8">
              <h1 className="inline-block text-3xl font-bold text-slate-900 dark:text-slate-100 sm:text-4xl md:text-5xl lg:text-6xl leading-tight">
                {BRAND.name}
              </h1>
            </div>

            {/* Tagline */}
            <p className="mx-auto mb-6 sm:mb-8 max-w-2xl text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed">
              {BRAND.tagline}
            </p>

            {/* Description */}
            <p className="mx-auto mb-8 sm:mb-12 max-w-3xl text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed px-4 sm:px-0">
              Transform your productivity with a clean, intuitive GTD-inspired
              task management application. Capture everything, clarify what
              matters, organize systematically, reflect regularly, and engage
              confidently.
            </p>

            {/* CTA Buttons - Mobile optimized */}
            <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 md:flex-row md:gap-6 px-4 sm:px-0">
              <Button
                asChild
                size="touch"
                className="w-full max-w-xs bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 sm:w-auto min-h-[48px] text-base font-semibold active:scale-95 transition-all duration-200"
              >
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center gap-2"
                >
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="touch"
                className="w-full max-w-xs border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-auto min-h-[48px] text-base active:scale-95 transition-all duration-200"
              >
                <Link
                  href="#methodology"
                  className="flex items-center justify-center"
                >
                  Learn About GTD
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-col items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-400 sm:flex-row sm:gap-8">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>Free to use</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>Privacy focused</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>Mobile optimized</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-teal-200 opacity-20 blur-3xl dark:bg-teal-800" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-slate-200 opacity-20 blur-3xl dark:bg-slate-700" />
      </div>
    </section>
  );
}

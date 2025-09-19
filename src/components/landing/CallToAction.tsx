"use client";

import { BRAND } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";

export function CallToAction() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Get Things Done?
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-300">
            Start your journey to stress-free productivity today. No credit card
            required.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Button
              asChild
              size="lg"
              className="w-full bg-teal-600 text-white hover:bg-teal-700 sm:w-auto"
            >
              <Link href="/auth/login" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Sign Up with Email
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white sm:w-auto"
            >
              <Link href="#methodology">Learn More</Link>
            </Button>
          </div>

          <div className="mt-8 text-sm text-slate-400">
            <p>
              Join thousands using ClarityDone to achieve stress-free
              productivity
            </p>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-400">Free</div>
              <div className="text-sm text-slate-300">No hidden costs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-400">Private</div>
              <div className="text-sm text-slate-300">
                Your data stays yours
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-400">Simple</div>
              <div className="text-sm text-slate-300">Start in seconds</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

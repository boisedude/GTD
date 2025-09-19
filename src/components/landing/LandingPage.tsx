"use client";

import { Hero } from "./Hero";
import { GTDMethodology } from "./GTDMethodology";
import { Features } from "./Features";
import { CallToAction } from "./CallToAction";

export function LandingPage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <GTDMethodology />
      <Features />
      <CallToAction />
    </main>
  );
}

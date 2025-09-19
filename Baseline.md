# GTD App Baseline Summary & Guidance

## What is GTD?

Getting Things Done (GTD) is a productivity methodology created by David Allen. It helps users capture, clarify, organize, and execute tasks with confidence. The five core steps are:

1. **Capture** – Collect everything that has your attention.
2. **Clarify** – Decide what each item means and what action is required.
3. **Organize** – Place items into trusted lists or categories.
4. **Reflect** – Review regularly to keep priorities clear.
5. **Engage** – Focus on the right task at the right time.

The outcome is a **“mind like water”** state—less stress, more focus, and higher productivity.

> **Note:**  
> This app is _inspired by_ the principles of David Allen’s **Getting Things Done (GTD)** methodology.  
> We are not affiliated with or licensed by David Allen or the GTD brand.

---

## What Users Should Get From the App

The app should deliver a **frictionless GTD-like experience**, with AI-powered assistance that makes GTD principles natural and rewarding:

- **Effortless Capture** – Quickly add tasks, notes, or ideas from any screen.
- **Clarity and Control** – Break items into concrete next actions, projects, or reference material.
- **Trusted Organization** – Maintain clean lists (Next Actions, Waiting For, Someday/Maybe, Projects).
- **Smart Reflection** – Support daily/weekly reviews with guided prompts.
- **Guided Productivity** – AI coaching that nudges users toward best practices.
- **Peace of Mind** – Confidence that nothing is slipping through the cracks.

**Baseline promise:**  
“Capture everything, clarify commitments, and execute with calm focus—without thinking about the system itself.”

---

## Application Style Guidance (for Codex)

### General UX

- **Simple, uncluttered design** – Minimal visual noise, no unnecessary widgets.
- **Mobile-first interactions** – Fast input, thumb-friendly layouts, and offline-safe.
- **AI-assisted UX** – Users should feel guided, not overwhelmed.

### Visual Style

- **Typography** – Clean sans-serif (e.g., Inter, Roboto, or Tailwind defaults).
- **Color palette** – Neutral background with **1–2 accent colors** for focus states (e.g., light mode: white/gray with aqua or blue accents).
- **Spacing** – Adequate padding, card-based layouts, clear separation of lists.

### Components

- **Capture input box** always visible, top-level entry point.
- **List views** styled as cards or clean rows with icons for quick scanning.
- **Action buttons** rounded, minimal text (icons + short labels).
- **Review flows** presented as step-by-step wizards or guided checklists.

### Accessibility

- High contrast ratios.
- Keyboard navigation support.
- Screen reader friendly labels.

### Interaction Style

- **Smooth animations** (subtle fades/slides).
- **Undo-friendly actions** (snackbar with undo option).
- **No modal overload** – prefer inline editing.

---

## Additional Guidance for Codex

- **Use Supabase for Auth + Data** (client-side auth, OTP-based login).
- **Use Shadcn UI components** for consistent styling with Tailwind.
- **Next.js 15 SSR caveats** – lean on client-side rendering for Supabase auth flows.
- **Include Playwright tests** for capturing UX flows (login, capture, review).
- **Ensure test Supabase account** is provisioned for validation.
- **Research Supabase + Vercel best practices** for deployment consistency.

---

## Deliverable Reminder

- App must enable **MVP-level GTD workflow** (capture → clarify → organize → reflect → engage).
- Prioritize **speed of input** and **trust in organization** over advanced features.
- Build with **latest stable builds** and **well-maintained components** (avoid custom when proven modules exist).
- Clearly state: **“Inspired by David Allen & GTD, not affiliated or licensed.”**

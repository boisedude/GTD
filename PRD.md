# Clarity Done PRD (Product Requirements Document)

## 1. Overview

A modern productivity app **inspired by David Allen’s Getting Things Done (GTD)** methodology.  
The app helps users capture tasks, clarify next actions, organize projects, and reflect with ease.  
It integrates **AI assistance** to coach users in applying GTD best practices.

⚠️ **Disclaimer**:  
This app is _inspired by_ GTD. We are not affiliated with or licensed by David Allen or GTD®.

---

## 2. Goals

- Provide users with a **trusted system** for managing tasks and commitments.
- Make the GTD process **easy, fast, and rewarding** on mobile and web.
- Use AI to **guide reflection and decision-making** without overwhelming users.
- Ensure **privacy, security, and data deletion** are available from MVP.

---

## 3. MVP Scope

### Core Features

- **Capture**: Quick-add tasks (text + optional tags).
- **Clarify**: Simple prompts to convert tasks into Next Actions, Projects, or References.
- **Organize**: Predefined GTD lists (Next Actions, Waiting For, Someday/Maybe, Projects).
- **Reflect**: Daily/weekly review checklists with guided AI coaching.
- **Engage**: Contextual suggestions (“Here’s what you can do right now”).
- **Auth**: OTP login via Supabase (client-side auth).

### Out of Scope (MVP)

- Team collaboration.
- Advanced integrations (Google Calendar, Slack, etc.).
- Native offline sync.

---

## 4. User Experience Principles

- **Mobile-first**: fast capture, thumb-friendly.
- **Clarity**: simple, clean UI with minimal friction.
- **Trustworthy**: nothing is lost, everything is accessible.
- **AI as guide, not controller**: AI suggests, user decides.

---

## 5. Safe Language Pack (Disclaimers & Phrasing)

### Must-Have Phrases

- “Inspired by David Allen & GTD”
- “This app is not affiliated with or licensed by David Allen or GTD®.”
- “Designed around GTD principles, adapted for a modern, AI-powered workflow.”

### Tooltip / Onboarding Examples

- ✅ “In GTD, tasks are captured so your mind doesn’t have to hold them. Here’s your Capture box.”
- ✅ “Weekly Reviews keep your system trusted. We’ll guide you through it.”
- ❌ Avoid saying "Official Clarity Done" or "Licensed GTD tool."

---

## 6. Technical Guidance

- **Framework**: Next.js 15 + Vercel.
- **Database/Auth**: Supabase.
- **UI Components**: Shadcn UI + Tailwind.
- **Testing**: Playwright for UX flow validation.
- **Deployment**: Client-side auth, Supabase MCP for setup, Vercel hosting.

---

## 7. Success Criteria (MVP)

- Users can:
  - Create and capture tasks in under 5 seconds.
  - Organize tasks into GTD-style lists.
  - Complete a daily or weekly review with guided prompts.
- Clear disclaimers visible in onboarding and About page.
- Functional on both desktop and mobile browsers.

---

## 8. Next Steps (Post-MVP Ideas)

- Integrations: Calendar, Email, Slack.
- AI summarization of weekly reviews.
- Offline-first mobile app.
- Collaboration features.

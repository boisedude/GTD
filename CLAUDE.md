# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a GTD (Getting Things Done) productivity app project inspired by David Allen's methodology. The codebase will be built as a Next.js 15 web application with Supabase backend.

**Important Legal Notice**: This app is inspired by GTD principles but is NOT affiliated with or licensed by David Allen or GTD®. Always include appropriate disclaimers in user-facing content.

## Architecture & Tech Stack

- **Frontend**: Next.js 15 with client-side rendering for auth flows
- **Hosting**: Vercel (Preview + Production environments)
- **Database & Auth**: Supabase (Postgres + OTP email login)
- **UI Framework**: Shadcn UI with Tailwind CSS
- **Testing**: Playwright for end-to-end UX validation
- **Deployment**: Vercel with automatic deployments

## Data Model

### Core Tables

- **users**: id, email, timestamps
- **tasks**: id, user_id, title, description, status (captured/next_action/project/waiting_for/someday), project_id, timestamps
- **projects**: id, user_id, name, status (active/complete), timestamps
- **reviews**: id, user_id, type (daily/weekly), completed_at

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npx playwright test` - Run Playwright e2e tests

**Important Note on Production Builds:**
- When running production builds (`npm run build`), you MUST set `NODE_ENV=production` explicitly
- Command: `export NODE_ENV=production && npm run build`
- The environment seems to persist NODE_ENV=development which causes Next.js warnings
- This is required to avoid "non-standard NODE_ENV value" warnings during builds

## Core Features (MVP Scope)

1. **Capture**: Quick-add tasks with optional tags
2. **Clarify**: Convert tasks into Next Actions, Projects, or References
3. **Organize**: GTD-style lists (Next Actions, Waiting For, Someday/Maybe, Projects)
4. **Reflect**: Daily/weekly review checklists with AI coaching
5. **Engage**: Contextual task suggestions

## Key Requirements

- **Mobile-first design**: Fast capture, thumb-friendly interactions
- **Client-side auth**: OTP email login via Supabase
- **Row-level security**: Users only access their own data
- **Privacy**: Support account deletion from MVP
- **Performance**: Task capture in under 5 seconds
- **Disclaimers**: Clearly state GTD inspiration without affiliation

## UI/UX Guidelines

- Clean, uncluttered design with minimal visual noise
- Capture input box always visible as top-level entry point
- Card-based layouts with adequate spacing
- Neutral color palette with 1-2 accent colors
- Smooth animations with undo-friendly actions
- Accessibility: high contrast, keyboard navigation, screen reader support

## Testing Strategy

- Playwright tests for core flows: login, capture, organize, review
- Separate Supabase project for dev/test environment
- Seeded test accounts with OTP login
- Production gating with Playwright test validation

## Important Notes

- Avoid creating team collaboration features (out of MVP scope)
- No advanced integrations (Google Calendar, Slack) in MVP
- Focus on speed of input and trust in organization
- Use proven components over custom solutions
- Ensure proper GTD disclaimers in all user-facing content

# GTD App ARD (Architectural Requirements Document)

## 1. System Architecture

- **Frontend**: Next.js 15, client-side rendering for auth flows.
- **Hosting**: Vercel (Preview + Production environments).
- **Database & Auth**: Supabase (Postgres + OTP login).
- **Testing**: Playwright for end-to-end UX validation.
- **UI**: Shadcn UI with Tailwind styling.
- **Agents/MCP**: Supabase MCP, Shadcn MCP, Playwright MCP.

---

## 2. Data Model (MVP)

### Tables

- **users**
  - id (uuid, primary key)
  - email (string, unique)
  - created_at, updated_at

- **tasks**
  - id (uuid, primary key)
  - user_id (fk → users.id)
  - title (string)
  - description (text, optional)
  - status (enum: captured, next_action, project, waiting_for, someday)
  - project_id (fk → projects.id, nullable)
  - created_at, updated_at

- **projects**
  - id (uuid, primary key)
  - user_id (fk → users.id)
  - name (string)
  - status (active/complete)
  - created_at, updated_at

- **reviews**
  - id (uuid, primary key)
  - user_id (fk → users.id)
  - type (daily/weekly)
  - completed_at (timestamp)

---

## 3. Auth & Security

- OTP email-based login only.
- Supabase policies for row-level security (RLS).
- Users only access their own data.
- Support account deletion on request.

---

## 4. CI/CD

- Vercel → Preview deployments for feature branches.
- Production → Main branch deploy with Playwright test gating.
- Automatic rollback on failed builds.

---

## 5. Dev/Test Environment

- **Separate Supabase project** for dev/test.
- **Seeded test accounts** with OTP login.
- **Playwright scripts** for login + core flows (capture, organize, review).

---

## 6. Extensibility (Future)

- **Integrations**: Calendar, Slack, Email ingestion.
- **AI Coaching**: GPT-powered review summaries, task suggestions.
- **Offline Sync**: Mobile-first local storage with sync.
- **Team Mode**: Shared projects and delegated tasks.

---

## 7. Architectural Decisions (ADRs)

- Client-side auth chosen to avoid SSR issues with Supabase.
- Shadcn UI selected for consistent UX and Tailwind compatibility.
- OTP login selected as more mobile-friendly than magic links.

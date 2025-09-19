# Contributing to GTD App

## Development Setup

### Prerequisites
- Node.js 18+
- pnpm package manager
- Supabase account
- Vercel account (for deployment)

### Getting Started

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Fill in your Supabase credentials
   ```

3. **Run development server**
   ```bash
   pnpm dev
   ```

4. **Run tests**
   ```bash
   # Unit tests
   pnpm test

   # E2E tests
   pnpm test:e2e

   # Build test
   pnpm build
   ```

## Project Structure

- `/src/app/` - Next.js App Router pages and layouts
- `/src/components/` - Reusable UI components
- `/src/lib/` - Utilities, database, and auth logic
- `/src/types/` - TypeScript type definitions
- `/src/hooks/` - Custom React hooks
- `/src/stores/` - Zustand state management
- `/docs/` - Architecture and development documentation

## Development Workflow

### 1. Component Development
- Use Shadcn UI as base components
- Follow mobile-first responsive design
- Ensure accessibility (WCAG 2.1 AA)
- Document props and usage examples

### 2. Database Changes
- Update Supabase migrations
- Update TypeScript types
- Test RLS policies thoroughly
- Document schema changes

### 3. Feature Development
- Follow GTD methodology principles
- Maintain mobile-first UX
- Include proper error handling
- Add loading states for async operations

### 4. Testing Requirements
- Unit tests for utility functions
- Component tests for complex logic
- E2E tests for critical user flows
- Manual testing on mobile devices

## Code Standards

### TypeScript
- Strict mode enabled
- Proper type definitions for all data
- Use interfaces for component props
- Avoid `any` types

### React
- Functional components with hooks
- Use React Hook Form for forms
- Implement proper error boundaries
- Follow React best practices

### Styling
- Tailwind CSS utility classes
- Consistent design system tokens
- Mobile-first responsive design
- Dark mode support (future)

### State Management
- Zustand for client state
- Supabase for server state
- Minimize prop drilling
- Clear state boundaries

## GTD-Specific Guidelines

### Terminology
- Use GTD-approved language (see `Baseline.md`)
- Include proper disclaimers about GTD inspiration
- Avoid claiming official GTD affiliation

### User Experience
- Capture should be lightning-fast
- Lists should be easily scannable
- Reviews should feel guided, not overwhelming
- AI coaching should suggest, not dictate

### Performance
- Task capture in under 5 seconds
- Smooth animations and transitions
- Offline-capable (future enhancement)
- Optimistic UI updates

## Commit Guidelines

### Format
```
type(scope): description

body (optional)
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```
feat(auth): implement OTP email login
fix(tasks): resolve capture input focus issue
docs(api): update Supabase schema documentation
```

## Legal Requirements

### GTD Disclaimers
Always include appropriate disclaimers:
- "Inspired by David Allen & GTD"
- "Not affiliated with or licensed by David Allen or GTD®"
- "Designed around GTD principles, adapted for modern workflow"

### Privacy & Security
- Never log sensitive user data
- Follow GDPR/privacy best practices
- Implement proper data deletion
- Secure all API endpoints

## Before Submitting

- [ ] Code builds successfully (`pnpm build`)
- [ ] All tests pass (`pnpm test`)
- [ ] E2E tests pass (`pnpm test:e2e`)
- [ ] No TypeScript errors
- [ ] Mobile responsive design verified
- [ ] Accessibility tested
- [ ] GTD disclaimers included where needed
- [ ] Documentation updated
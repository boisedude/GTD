# Clarity Done

**Calm. Clear. Done.**

A productivity application inspired by David Allen's Getting Things Done (GTD) methodology. This app helps you capture, clarify, organize, reflect, and engage with your tasks and projects for stress-free productivity.

**Important Disclaimer**: This app is inspired by GTD principles but is NOT affiliated with or licensed by David Allen or GTD®.

## Features

- **Quick Capture**: Instantly capture thoughts and tasks without friction
- **GTD Workflow**: Follow the proven five-step methodology (Capture, Clarify, Organize, Reflect, Engage)
- **Smart Organization**: Organize tasks into Next Actions, Projects, Waiting For, and Someday/Maybe lists
- **Reviews**: Built-in daily and weekly review processes
- **Mobile-First**: Optimized for fast capture on mobile devices
- **Privacy-Focused**: Your data stays secure with row-level security

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **UI**: Shadcn/ui with Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Authentication)
- **Hosting**: Vercel
- **Testing**: Playwright for end-to-end testing

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Supabase account

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd clarity-done
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Configure your Supabase project settings in `.env.local`

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run type-check   # Run TypeScript checks
npm run test         # Run Playwright tests
npm run test:ui      # Run Playwright tests with UI
```

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # Reusable React components
├── contexts/         # React contexts (auth, etc.)
├── lib/              # Utility functions and configurations
├── types/            # TypeScript type definitions
└── styles/           # Global styles and CSS
```

## Database Schema

The app uses Supabase with the following core tables:

- `users` - User accounts and preferences
- `tasks` - Individual tasks and items
- `projects` - Projects and multi-step outcomes
- `reviews` - Review completion tracking

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This application is inspired by David Allen's Getting Things Done (GTD) methodology but is not affiliated with, endorsed by, or licensed by David Allen or GTD®. GTD® is a registered trademark of David Allen Company.

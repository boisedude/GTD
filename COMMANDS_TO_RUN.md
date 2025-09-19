# Complete Supabase Database Setup Commands

This document contains the exact commands you need to run to set up your Supabase database for the GTD application.

## ✅ Files Created

The following files have been created in your project:

- `/mnt/d/Projects/GTD/supabase/migrations/20240918000001_initial_schema.sql` - Complete database schema
- `/mnt/d/Projects/GTD/supabase/types.ts` - TypeScript types for your database
- `/mnt/d/Projects/GTD/supabase/seed.sql` - Sample data (optional)
- `/mnt/d/Projects/GTD/.env.local` - Environment variables template
- `/mnt/d/Projects/GTD/scripts/validate-database.ts` - Database validation script
- `/mnt/d/Projects/GTD/SUPABASE_SETUP.md` - Detailed setup guide
- `/mnt/d/Projects/GTD/.gitignore` - Git ignore rules

## 🎯 Quick Setup Steps

### 1. Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in project details and create the project

### 2. Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - Project URL
   - anon public key
   - service_role key

### 3. Update Environment Variables

Edit the `.env.local` file and replace the placeholder values:

```bash
# Edit .env.local with your actual Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

### 4. Run Database Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `supabase/migrations/20240918000001_initial_schema.sql`
4. Paste and click "Run"

### 5. Validate Setup (Optional)

```bash
# Run the validation script to check everything is working
npm run validate-db
```

## 🗄️ Database Schema Created

### Tables

- **users** - User profiles (extends Supabase auth)
- **tasks** - GTD tasks with status, context, projects
- **projects** - GTD projects containing tasks
- **reviews** - Daily/weekly/monthly review records

### Features

- ✅ Row Level Security (RLS) - Users only see their own data
- ✅ Real-time subscriptions - Live updates
- ✅ Automatic timestamps - created_at/updated_at
- ✅ Performance indexes - Optimized queries
- ✅ Type safety - PostgreSQL enums
- ✅ Foreign key constraints - Data integrity

## 🔧 Available Commands

```bash
# Start development server
npm run dev

# Validate database setup
npm run validate-db

# Run tests
npm run test

# Type checking
npm run type-check

# Build for production
npm run build
```

## 📊 Database Types

The TypeScript types are available in `supabase/types.ts`:

```typescript
import type { Database } from "./supabase/types";

// Use with Supabase client
const supabase = createClient<Database>(url, key);
```

## 🔐 Security Notes

- ✅ Environment variables are in `.gitignore`
- ✅ RLS policies prevent unauthorized data access
- ✅ Service role key should be kept secure
- ✅ All tables have proper foreign key constraints

## 🚀 Next Steps

After completing the database setup:

1. Test user authentication flows
2. Implement task creation and management
3. Build the GTD workflow features
4. Set up your production environment

## 📚 Additional Resources

- Complete setup guide: `SUPABASE_SETUP.md`
- Database validation: `scripts/validate-database.ts`
- Sample data: `supabase/seed.sql`
- Project overview: `CLAUDE.md`

---

**Important**: Your `.env.local` file contains sensitive credentials. Never commit it to version control!

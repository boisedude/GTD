# Supabase Database Setup Guide

This guide will help you set up the complete Supabase database for your GTD (Getting Things Done) application.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Access to the Supabase dashboard

## Step 1: Create a New Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `gtd-app` (or your preferred name)
   - **Database Password**: Generate a strong password and save it securely
   - **Region**: Choose the region closest to your users
5. Click "Create new project"
6. Wait for the project to be provisioned (usually takes 1-2 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like `https://your-project-ref.supabase.co`)
   - **anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role key** (also starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`) - Keep this secure!

## Step 3: Configure Environment Variables

1. Open the `.env.local` file in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

⚠️ **Important**: Never commit your `.env.local` file to version control. It's already in `.gitignore`.

## Step 4: Run the Database Migration

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `supabase/migrations/20240918000001_initial_schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the migration

This will create:

- All database tables (users, tasks, projects, reviews)
- Custom PostgreSQL enums for type safety
- Row Level Security (RLS) policies
- Database indexes for performance
- Triggers for automatic timestamp updates
- Real-time subscriptions

## Step 5: Configure Authentication

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Configure the following settings:

### Email Templates (Optional)

- Customize the email templates for confirmation and password reset emails
- Add your app's branding and styling

### Auth Providers

- **Email**: Already enabled by default
- You can enable additional providers later (Google, GitHub, etc.)

### Site URL

- Set this to your development URL: `http://localhost:3000`
- For production, update this to your deployed domain

## Step 6: Test the Setup

1. Start your development server:

   ```bash
   npm run dev
   ```

2. The Supabase client should now be able to connect to your database

3. You can test the connection by checking the browser console for any Supabase-related errors

## Step 7: Optional - Add Sample Data

If you want to add sample data for development:

1. Go to **SQL Editor** in your Supabase dashboard
2. Open `supabase/seed.sql`
3. Uncomment the sample data sections
4. Replace `USER_ID` placeholders with actual user IDs after creating test accounts
5. Run the seed script

## Database Schema Overview

### Tables Created

1. **users** - Extends Supabase auth.users with app-specific fields
2. **tasks** - Core GTD tasks with status, context, and project relationships
3. **projects** - GTD projects that can contain multiple tasks
4. **reviews** - Daily/weekly/monthly review records

### Key Features

- **Row Level Security**: Users can only access their own data
- **Real-time subscriptions**: Live updates when data changes
- **Automatic timestamps**: `created_at` and `updated_at` fields managed automatically
- **Type safety**: PostgreSQL enums ensure valid status values
- **Performance indexes**: Optimized queries for common operations

## Troubleshooting

### Common Issues

1. **Connection errors**: Double-check your environment variables
2. **RLS policy errors**: Ensure you're authenticated when testing
3. **Migration errors**: Check the SQL Editor for specific error messages

### Getting Help

- Check the Supabase documentation: https://supabase.com/docs
- Join the Supabase Discord: https://discord.supabase.com
- Review the GTD app's technical documentation in this repository

## Security Notes

- The service role key has admin privileges - keep it secure
- RLS policies ensure data isolation between users
- All tables have proper foreign key constraints
- User data is automatically cleaned up when auth users are deleted

## Next Steps

After completing this setup:

1. Test user registration and authentication flows
2. Verify that tasks, projects, and reviews can be created
3. Test real-time updates in your application
4. Configure your production environment with the same steps

-- GTD Application Seed Data
-- This file contains sample data for development and testing

-- Sample user data will be created automatically when users sign up via Supabase Auth

-- Sample projects (these will be created after users sign up)
-- Example for user with ID '00000000-0000-0000-0000-000000000000' (replace with actual user ID)

/*
-- Uncomment and replace USER_ID with actual user ID after creating test users

INSERT INTO public.projects (user_id, name, description, status) VALUES
('USER_ID', 'Home Organization', 'Organize and declutter the home environment', 'active'),
('USER_ID', 'Career Development', 'Focus on professional growth and skill development', 'active'),
('USER_ID', 'Health & Fitness', 'Maintain physical and mental well-being', 'active'),
('USER_ID', 'Learning Spanish', 'Become conversational in Spanish', 'active');

-- Sample tasks
INSERT INTO public.tasks (user_id, title, description, status, context) VALUES
('USER_ID', 'Buy groceries', 'Get items for this week', 'next_action', '@errands'),
('USER_ID', 'Call dentist', 'Schedule routine cleaning appointment', 'next_action', '@calls'),
('USER_ID', 'Review quarterly goals', 'Assess progress on Q4 objectives', 'next_action', '@computer'),
('USER_ID', 'Organize desk drawer', 'Sort through papers and supplies', 'someday', '@home'),
('USER_ID', 'Research vacation destinations', 'Look into summer travel options', 'someday', '@computer'),
('USER_ID', 'Book flight to conference', 'Waiting for confirmation email with details', 'waiting_for', null);

-- Link some tasks to projects
UPDATE public.tasks SET project_id = (SELECT id FROM public.projects WHERE name = 'Home Organization' AND user_id = 'USER_ID')
WHERE title = 'Organize desk drawer' AND user_id = 'USER_ID';

UPDATE public.tasks SET project_id = (SELECT id FROM public.projects WHERE name = 'Career Development' AND user_id = 'USER_ID')
WHERE title = 'Book flight to conference' AND user_id = 'USER_ID';

-- Sample review
INSERT INTO public.reviews (user_id, type, notes) VALUES
('USER_ID', 'weekly', 'Good progress on organizing tasks. Need to focus more on next actions vs someday items.');
*/
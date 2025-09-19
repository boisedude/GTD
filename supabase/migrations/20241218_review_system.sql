-- Migration for GTD Review System
-- This adds tables for review sessions, metrics, and analytics

-- Create review_sessions table for tracking review progress
CREATE TABLE IF NOT EXISTS review_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type review_type NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
  current_step INTEGER DEFAULT 0,
  total_steps INTEGER NOT NULL,
  completed_steps TEXT[] DEFAULT '{}',
  session_data JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create review_metrics table for tracking daily productivity metrics
CREATE TABLE IF NOT EXISTS review_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  tasks_completed INTEGER DEFAULT 0,
  tasks_created INTEGER DEFAULT 0,
  projects_updated INTEGER DEFAULT 0,
  inbox_items_processed INTEGER DEFAULT 0,
  daily_reviews_completed INTEGER DEFAULT 0,
  weekly_reviews_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Add additional columns to reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS tasks_reviewed INTEGER DEFAULT 0;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS projects_reviewed INTEGER DEFAULT 0;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS progress_data JSONB;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_review_sessions_user_id ON review_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_review_sessions_status ON review_sessions(status);
CREATE INDEX IF NOT EXISTS idx_review_sessions_type ON review_sessions(type);
CREATE INDEX IF NOT EXISTS idx_review_metrics_user_date ON review_metrics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_reviews_user_type ON reviews(user_id, type);
CREATE INDEX IF NOT EXISTS idx_reviews_completed_at ON reviews(completed_at);

-- Enable Row Level Security
ALTER TABLE review_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for review_sessions
CREATE POLICY "Users can only access their own review sessions" ON review_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for review_metrics
CREATE POLICY "Users can only access their own review metrics" ON review_metrics
  FOR ALL USING (auth.uid() = user_id);

-- Update the reviews table RLS policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'reviews'
    AND policyname = 'Users can only access their own reviews'
  ) THEN
    CREATE POLICY "Users can only access their own reviews" ON reviews
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_review_sessions_updated_at ON review_sessions;
CREATE TRIGGER update_review_sessions_updated_at
  BEFORE UPDATE ON review_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically update metrics when reviews are completed
CREATE OR REPLACE FUNCTION update_review_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    INSERT INTO review_metrics (user_id, date, daily_reviews_completed, weekly_reviews_completed)
    VALUES (
      NEW.user_id,
      NEW.completed_at::date,
      CASE WHEN NEW.type = 'daily' THEN 1 ELSE 0 END,
      CASE WHEN NEW.type = 'weekly' THEN 1 ELSE 0 END
    )
    ON CONFLICT (user_id, date)
    DO UPDATE SET
      daily_reviews_completed = review_metrics.daily_reviews_completed +
        CASE WHEN NEW.type = 'daily' THEN 1 ELSE 0 END,
      weekly_reviews_completed = review_metrics.weekly_reviews_completed +
        CASE WHEN NEW.type = 'weekly' THEN 1 ELSE 0 END;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic metrics updates
DROP TRIGGER IF EXISTS auto_update_review_metrics ON reviews;
CREATE TRIGGER auto_update_review_metrics
  AFTER UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_review_metrics();

-- Grant necessary permissions
GRANT ALL ON review_sessions TO authenticated;
GRANT ALL ON review_metrics TO authenticated;

-- Insert some sample AI coaching prompts (these would be managed in the application)
COMMENT ON TABLE review_sessions IS 'Tracks active and completed review sessions with progress data';
COMMENT ON TABLE review_metrics IS 'Daily aggregated metrics for review analytics and insights';
COMMENT ON COLUMN reviews.progress_data IS 'JSON data containing review step progress and completion details';
COMMENT ON COLUMN review_sessions.session_data IS 'JSON data containing step-specific information collected during the review';

-- Create view for review analytics
CREATE OR REPLACE VIEW review_analytics AS
SELECT
  r.user_id,
  r.type,
  COUNT(*) as total_reviews,
  AVG(r.duration_minutes) as avg_duration,
  AVG(r.tasks_reviewed) as avg_tasks_reviewed,
  MIN(r.completed_at) as first_review,
  MAX(r.completed_at) as last_review,
  EXTRACT(DAYS FROM MAX(r.completed_at) - MIN(r.completed_at)) + 1 as days_active
FROM reviews r
WHERE r.completed_at IS NOT NULL
GROUP BY r.user_id, r.type;

GRANT SELECT ON review_analytics TO authenticated;

-- RLS policy for the view
CREATE POLICY "Users can only see their own review analytics" ON review_analytics
  FOR SELECT USING (auth.uid() = user_id);
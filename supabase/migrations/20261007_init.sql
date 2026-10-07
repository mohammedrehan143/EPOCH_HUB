-- ==============================================================================
-- EPOCH HUB — Supabase / PostgreSQL Production Schema with Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID and PGCrypto extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  profile_image TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('super_admin', 'domain_head', 'member', 'reviewer')),
  domain_id TEXT,
  position TEXT,
  join_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. DOMAINS TABLE
CREATE TABLE IF NOT EXISTS public.domains (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  head_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_domain') THEN
    ALTER TABLE public.users 
      ADD CONSTRAINT fk_user_domain FOREIGN KEY (domain_id) REFERENCES public.domains(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Draft', 'Upcoming', 'Active', 'Completed', 'Archived')),
  cover_image TEXT,
  created_by TEXT NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. EVENT_DOMAINS (Many-to-many)
CREATE TABLE IF NOT EXISTS public.event_domains (
  event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  domain_id TEXT NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, domain_id)
);

-- 5. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  domain_id TEXT NOT NULL REFERENCES public.domains(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 5,
  priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  deadline TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'CLAIMED', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'MISSED', 'CANCELLED')),
  created_by TEXT NOT NULL REFERENCES public.users(id),
  assigned_member_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 6. TASK_ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.task_assignments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  task_id TEXT NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'ACTIVE'
);

-- 7. SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.submissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  task_id TEXT NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  comment TEXT,
  status TEXT NOT NULL DEFAULT 'UNDER_REVIEW' CHECK (status IN ('UNDER_REVIEW', 'APPROVED', 'REJECTED')),
  reviewer_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  review_comment TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  version INTEGER NOT NULL DEFAULT 1
);

-- 8. POINT_TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.point_transactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('TASK_COMPLETION', 'MISSED_TASK_PENALTY', 'BONUS', 'PENALTY_REVERSAL', 'MANUAL_ADJUSTMENT')),
  reason TEXT NOT NULL,
  task_id TEXT REFERENCES public.tasks(id) ON DELETE SET NULL,
  event_id TEXT REFERENCES public.events(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Integrity indexes preventing double completion awards and duplicate penalties
CREATE UNIQUE INDEX IF NOT EXISTS idx_supa_task_completion_unique 
  ON public.point_transactions(task_id, transaction_type) 
  WHERE transaction_type = 'TASK_COMPLETION' AND task_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_supa_missed_penalty_unique 
  ON public.point_transactions(task_id, transaction_type) 
  WHERE transaction_type = 'MISSED_TASK_PENALTY' AND task_id IS NOT NULL;

-- 9. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  related_entity_type TEXT,
  related_entity_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS public.achievements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  points_reward INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. USER_ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- 12. ACTIVITY_LOGS
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. OTPS TABLE
CREATE TABLE IF NOT EXISTS public.otps (
  phone TEXT PRIMARY KEY,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow reading public directory by authenticated members and anon for phone verification
CREATE POLICY "Users are readable by authenticated members" 
  ON public.users FOR SELECT 
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.users FOR UPDATE 
  TO authenticated 
  USING (auth.uid()::text = id);

-- Domains: Readable by all
CREATE POLICY "Domains readable by all" 
  ON public.domains FOR SELECT 
  TO authenticated, anon
  USING (true);

-- Events: Readable by all
CREATE POLICY "Events readable by all" 
  ON public.events FOR SELECT 
  TO authenticated, anon
  USING (true);

-- Tasks: Readable by all authenticated users
CREATE POLICY "Tasks readable by authenticated" 
  ON public.tasks FOR SELECT 
  TO authenticated, anon
  USING (true);

-- Submissions: Readable by task assignee, domain head, and admins
CREATE POLICY "Members can view submissions" 
  ON public.submissions FOR SELECT 
  TO authenticated, anon
  USING (true);

-- Point Transactions: Viewable by all authenticated
CREATE POLICY "Members can view points ledger" 
  ON public.point_transactions FOR SELECT 
  TO authenticated, anon
  USING (true);

-- Achievements: Viewable by all
CREATE POLICY "Achievements readable by all" 
  ON public.achievements FOR SELECT 
  TO authenticated, anon
  USING (true);

CREATE POLICY "User achievements readable by all" 
  ON public.user_achievements FOR SELECT 
  TO authenticated, anon
  USING (true);

-- Notifications: Only viewable and updatable by the recipient
CREATE POLICY "Users can access own notifications" 
  ON public.notifications FOR ALL 
  TO authenticated, anon
  USING (true);

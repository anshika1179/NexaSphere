ALTER TABLE core_team_members
ADD COLUMN IF NOT EXISTS github_username TEXT,
ADD COLUMN IF NOT EXISTS leetcode_username TEXT,
ADD COLUMN IF NOT EXISTS cached_github_stats JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cached_leetcode_stats JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS sync_error_message TEXT;

"""add_portfolio_fields

Revision ID: 004
Revises: 003
Create Date: 2026-05-28 00:00:01.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.execute("""
    ALTER TABLE core_team_members
    ADD COLUMN IF NOT EXISTS github_username TEXT,
    ADD COLUMN IF NOT EXISTS leetcode_username TEXT,
    ADD COLUMN IF NOT EXISTS cached_github_stats JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS cached_leetcode_stats JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS sync_error_message TEXT;
    """)

def downgrade() -> None:
    op.execute("""
    ALTER TABLE core_team_members
    DROP COLUMN IF EXISTS github_username,
    DROP COLUMN IF EXISTS leetcode_username,
    DROP COLUMN IF EXISTS cached_github_stats,
    DROP COLUMN IF EXISTS cached_leetcode_stats,
    DROP COLUMN IF EXISTS last_synced_at,
    DROP COLUMN IF EXISTS sync_status,
    DROP COLUMN IF EXISTS sync_error_message;
    """)

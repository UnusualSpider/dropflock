package db

import (
	"context"
	"fmt"
)

// Migration returns the full SQL needed to bring a fresh or partially-migrated
// database up to the current schema. Statements are idempotent (IF NOT EXISTS
// or guarded DO $$ ... blocks) so re-running is safe. Migrations do NOT touch
// existing data — adding columns uses DEFAULT or nullable.
func (p *Pool) Migration(ctx context.Context) error {
	statements := []string{
		// ── updated_at trigger function (reusable) ───────────────────────
		`CREATE OR REPLACE FUNCTION set_updated_at()
		RETURNS TRIGGER AS $$
		BEGIN
			NEW.updated_at = NOW();
			RETURN NEW;
		END;
		$$ LANGUAGE plpgsql`,

		// ── issues ────────────────────────────────────────────────────────
		`CREATE TABLE IF NOT EXISTS issues (
			id          SERIAL PRIMARY KEY,
			slug        TEXT UNIQUE NOT NULL,
			title       TEXT NOT NULL,
			body        TEXT NOT NULL,
			category    TEXT NOT NULL DEFAULT 'general',
			published   BOOLEAN NOT NULL DEFAULT true,
			sort_order  INT NOT NULL DEFAULT 0,
			created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`ALTER TABLE issues
			ADD COLUMN IF NOT EXISTS tag     TEXT NOT NULL DEFAULT 'general',
			ADD COLUMN IF NOT EXISTS summary TEXT NOT NULL DEFAULT '',
			ADD COLUMN IF NOT EXISTS sources JSONB NOT NULL DEFAULT '[]'::jsonb`,
		`DO $$ BEGIN
			IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_issues_updated_at') THEN
				CREATE TRIGGER set_issues_updated_at
					BEFORE UPDATE ON issues
					FOR EACH ROW EXECUTE FUNCTION set_updated_at();
			END IF;
		END $$`,

		// ── groups ────────────────────────────────────────────────────────
		`CREATE TABLE IF NOT EXISTS groups (
			id          SERIAL PRIMARY KEY,
			name        TEXT NOT NULL,
			description TEXT,
			website     TEXT,
			email       TEXT,
			city        TEXT,
			state       TEXT NOT NULL,
			national    BOOLEAN NOT NULL DEFAULT false,
			published   BOOLEAN NOT NULL DEFAULT true,
			created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`ALTER TABLE groups
			ADD COLUMN IF NOT EXISTS slug       TEXT UNIQUE,
			ADD COLUMN IF NOT EXISTS scope      TEXT NOT NULL DEFAULT 'Local',
			ADD COLUMN IF NOT EXISTS focus      TEXT[] NOT NULL DEFAULT '{}',
			ADD COLUMN IF NOT EXISTS location   TEXT,
			ADD COLUMN IF NOT EXISTS lat        DOUBLE PRECISION,
			ADD COLUMN IF NOT EXISTS lng        DOUBLE PRECISION,
			ADD COLUMN IF NOT EXISTS url        TEXT,
			ADD COLUMN IF NOT EXISTS win        TEXT,
			ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0`,
		`CREATE INDEX IF NOT EXISTS idx_groups_state  ON groups(state)`,
		`CREATE INDEX IF NOT EXISTS idx_groups_scope  ON groups(scope)`,
		`CREATE INDEX IF NOT EXISTS idx_groups_focus  ON groups USING GIN(focus)`,
		`DO $$ BEGIN
			IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_groups_updated_at') THEN
				CREATE TRIGGER set_groups_updated_at
					BEFORE UPDATE ON groups
					FOR EACH ROW EXECUTE FUNCTION set_updated_at();
			END IF;
		END $$`,

		// ── stats ─────────────────────────────────────────────────────────
		`CREATE TABLE IF NOT EXISTS stats (
			id          SERIAL PRIMARY KEY,
			key         TEXT UNIQUE NOT NULL,
			value       TEXT NOT NULL,
			label       TEXT NOT NULL,
			source      TEXT,
			updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`ALTER TABLE stats
			ADD COLUMN IF NOT EXISTS emphasis   TEXT NOT NULL DEFAULT 'normal',
			ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0`,
		`CREATE INDEX IF NOT EXISTS idx_stats_sort ON stats(sort_order, id)`,

		// ── talking_points ───────────────────────────────────────────────
		`CREATE TABLE IF NOT EXISTS talking_points (
			id          SERIAL PRIMARY KEY,
			body        TEXT NOT NULL,
			category    TEXT NOT NULL DEFAULT 'general',
			sort_order  INT NOT NULL DEFAULT 0,
			published   BOOLEAN NOT NULL DEFAULT true,
			created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`ALTER TABLE talking_points
			ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT ''`,
		`CREATE INDEX IF NOT EXISTS idx_tp_cat_sort ON talking_points(category, sort_order)`,

		// ── security_incidents (timeline) ─────────────────────────────────
		`CREATE TABLE IF NOT EXISTS security_incidents (
			id          SERIAL PRIMARY KEY,
			title       TEXT NOT NULL,
			date        DATE,
			description TEXT NOT NULL,
			source_url  TEXT,
			flock_denied BOOLEAN NOT NULL DEFAULT false,
			published   BOOLEAN NOT NULL DEFAULT true,
			created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`ALTER TABLE security_incidents
			ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0`,
		`CREATE INDEX IF NOT EXISTS idx_sec_inc_date ON security_incidents(date, sort_order, id)`,
		`DO $$ BEGIN
			IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_security_incidents_updated_at') THEN
				CREATE TRIGGER set_security_incidents_updated_at
					BEFORE UPDATE ON security_incidents
					FOR EACH ROW EXECUTE FUNCTION set_updated_at();
			END IF;
		END $$`,

		// ── security_findings (CVE / vulnerability cards) ─────────────────
		`CREATE TABLE IF NOT EXISTS security_findings (
			id          SERIAL PRIMARY KEY,
			slug        TEXT UNIQUE NOT NULL,
			severity    TEXT NOT NULL DEFAULT 'HIGH',
			device      TEXT NOT NULL,
			title       TEXT NOT NULL,
			body        TEXT NOT NULL,
			source      TEXT NOT NULL,
			source_url  TEXT NOT NULL,
			sort_order  INT NOT NULL DEFAULT 0,
			published   BOOLEAN NOT NULL DEFAULT true,
			created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_sec_find_sort ON security_findings(sort_order, id)`,
		`DO $$ BEGIN
			IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_security_findings_updated_at') THEN
				CREATE TRIGGER set_security_findings_updated_at
					BEFORE UPDATE ON security_findings
					FOR EACH ROW EXECUTE FUNCTION set_updated_at();
			END IF;
		END $$`,

		// ── reps (RepFinder ZIP-prefix lookup) ────────────────────────────
		`CREATE TABLE IF NOT EXISTS reps (
			id            SERIAL PRIMARY KEY,
			zip_prefix    TEXT NOT NULL,
			level         TEXT NOT NULL,
			name          TEXT NOT NULL,
			role          TEXT NOT NULL,
			contact_url   TEXT,
			contact_email TEXT,
			contact_phone TEXT,
			created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_reps_zip_prefix ON reps(zip_prefix)`,
	}

	for _, stmt := range statements {
		if _, err := p.Exec(ctx, stmt); err != nil {
			return fmt.Errorf("migration failed:\n%s\n\nerror: %w", stmt, err)
		}
	}

	return nil
}

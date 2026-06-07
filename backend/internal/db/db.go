package db

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Pool wraps pgxpool and exposes helpers used by handlers.
type Pool struct {
	*pgxpool.Pool
}

// Connect opens a connection pool and verifies connectivity.
func Connect(ctx context.Context, dsn string) (*Pool, error) {
	cfg, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return nil, fmt.Errorf("parse dsn: %w", err)
	}

	// Sensible pool defaults — adjust for your load
	cfg.MaxConns = 20
	cfg.MinConns = 2
	cfg.MaxConnLifetime = 30 * time.Minute
	cfg.MaxConnIdleTime = 5 * time.Minute
	cfg.HealthCheckPeriod = 1 * time.Minute

	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("create pool: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("ping postgres: %w", err)
	}

	return &Pool{pool}, nil
}

// Migrate runs lightweight inline migrations so you don't need a separate
// migration tool for the initial schema. Add new statements to the slice —
// they're idempotent (IF NOT EXISTS).
func (p *Pool) Migrate(ctx context.Context) error {
	statements := []string{
		// Issues displayed on /issues page
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

		// Advocacy groups — location-searchable
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

		// Stats shown on homepage / issues pages
		`CREATE TABLE IF NOT EXISTS stats (
			id          SERIAL PRIMARY KEY,
			key         TEXT UNIQUE NOT NULL,
			value       TEXT NOT NULL,
			label       TEXT NOT NULL,
			source      TEXT,
			updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,

		// Talking points for the /act page
		`CREATE TABLE IF NOT EXISTS talking_points (
			id          SERIAL PRIMARY KEY,
			body        TEXT NOT NULL,
			category    TEXT NOT NULL DEFAULT 'general',
			sort_order  INT NOT NULL DEFAULT 0,
			published   BOOLEAN NOT NULL DEFAULT true,
			created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,

		// Security incidents / breach records for the /security page
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

		// Index for fast group lookups by state
		`CREATE INDEX IF NOT EXISTS idx_groups_state ON groups(state)`,

		// updated_at trigger function (reusable)
		`CREATE OR REPLACE FUNCTION set_updated_at()
		RETURNS TRIGGER AS $$
		BEGIN
			NEW.updated_at = NOW();
			RETURN NEW;
		END;
		$$ LANGUAGE plpgsql`,

		// Apply trigger to mutable tables
		`DO $$ BEGIN
			IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_issues_updated_at') THEN
				CREATE TRIGGER set_issues_updated_at
					BEFORE UPDATE ON issues
					FOR EACH ROW EXECUTE FUNCTION set_updated_at();
			END IF;
		END $$`,

		`DO $$ BEGIN
			IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_groups_updated_at') THEN
				CREATE TRIGGER set_groups_updated_at
					BEFORE UPDATE ON groups
					FOR EACH ROW EXECUTE FUNCTION set_updated_at();
			END IF;
		END $$`,

		`DO $$ BEGIN
			IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_security_incidents_updated_at') THEN
				CREATE TRIGGER set_security_incidents_updated_at
					BEFORE UPDATE ON security_incidents
					FOR EACH ROW EXECUTE FUNCTION set_updated_at();
			END IF;
		END $$`,
	}

	for _, stmt := range statements {
		if _, err := p.Exec(ctx, stmt); err != nil {
			return fmt.Errorf("migration failed:\n%s\n\nerror: %w", stmt, err)
		}
	}

	return nil
}
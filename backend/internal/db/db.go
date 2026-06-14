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

// Migrate applies the schema migrations and, if the database is empty, seeds
// it with the canonical hardcoded data so the site renders correctly on first
// boot. Re-running is a no-op once the seed has populated each table.
func (p *Pool) Migrate(ctx context.Context) error {
	if err := p.Migration(ctx); err != nil {
		return fmt.Errorf("schema migration: %w", err)
	}
	if err := p.MaybeSeed(ctx); err != nil {
		return fmt.Errorf("seed: %w", err)
	}
	return nil
}

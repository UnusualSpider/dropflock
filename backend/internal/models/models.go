package models

import (
	"encoding/json"
	"time"
)

// ── API response envelope ─────────────────────────────────────────────────────

type Response struct {
	Data  any    `json:"data"`
	Error string `json:"error,omitempty"`
}

func OK(data any) Response    { return Response{Data: data} }
func Err(msg string) Response { return Response{Error: msg} }

// ── Source / link pair (used in Issue.Sources etc.) ──────────────────────────

type Source struct {
	Label string `json:"label"`
	Href  string `json:"href"`
}

// ── Issues ────────────────────────────────────────────────────────────────────

// Issue is the public shape returned to the frontend. Tags are short labels
// (Mass Surveillance, Data Sharing, …); Sources is a list of citation links.
type Issue struct {
	ID        int       `json:"id"`
	Slug      string    `json:"slug"`
	Tag       string    `json:"tag"`
	Title     string    `json:"title"`
	Summary   string    `json:"summary"`
	Body      string    `json:"body"`
	Sources   []Source  `json:"sources"`
	SortOrder int       `json:"sort_order"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// IssueInput is the JSON shape accepted by POST /api/issues and PUT /api/issues/:id.
// The category column is still in the DB for backward-compat but the API uses
// `tag`; the handler maps one to the other.
type IssueInput struct {
	Slug      string   `json:"slug"      binding:"required"`
	Tag       string   `json:"tag"`
	Title     string   `json:"title"     binding:"required"`
	Summary   string   `json:"summary"`
	Body      string   `json:"body"      binding:"required"`
	Sources   []Source `json:"sources"`
	SortOrder int      `json:"sort_order"`
}

// ── Groups ────────────────────────────────────────────────────────────────────

// Group mirrors the frontend's data shape (id is the DB serial; slug is a
// stable URL-safe identifier; scope is "National" | "State" | "Local"; focus
// is a list of "Legal" | "Organizing" | "Research" | "Policy" | "Tools";
// location is a free-form "City, ST" string; lat/lng are optional for the
// map pin; win is an optional achievement blurb).
type Group struct {
	ID         int       `json:"id"`
	Slug       string    `json:"slug"`
	Name       string    `json:"name"`
	Scope      string    `json:"scope"`
	Focus      []string  `json:"focus"`
	Location   string    `json:"location"`
	Lat        *float64  `json:"lat,omitempty"`
	Lng        *float64  `json:"lng,omitempty"`
	URL        string    `json:"url"`
	Win        string    `json:"win,omitempty"`
	SortOrder  int       `json:"sort_order"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// GroupInput is the JSON shape accepted by POST /api/groups (the public
// Submit-Group form). All optional fields are nullable.
type GroupInput struct {
	Slug       string   `json:"slug"`
	Name       string   `json:"name"        binding:"required"`
	Scope      string   `json:"scope"`
	Focus      []string `json:"focus"`
	Location   string   `json:"location"`
	URL        string   `json:"url"`
	Email      string   `json:"email"`
	Win        string   `json:"win"`
	SortOrder  int      `json:"sort_order"`
}

// ── Stats ─────────────────────────────────────────────────────────────────────

// Stat is the public shape. `value` is the display string ("5,000+"), `label`
// is the caption ("Cities with FLOCK"), `emphasis` is "red" | "normal".
type Stat struct {
	ID        int    `json:"id"`
	Key       string `json:"key"`
	Value     string `json:"value"`
	Label     string `json:"label"`
	Emphasis  string `json:"emphasis"`
	Source    string `json:"source,omitempty"`
	SortOrder int    `json:"sort_order"`
	UpdatedAt time.Time `json:"updated_at"`
}

type StatInput struct {
	Key       string `json:"key"   binding:"required"`
	Value     string `json:"value" binding:"required"`
	Label     string `json:"label" binding:"required"`
	Emphasis  string `json:"emphasis"`
	Source    string `json:"source"`
	SortOrder int    `json:"sort_order"`
}

// ── Talking points ────────────────────────────────────────────────────────────

type TalkingPoint struct {
	ID        int    `json:"id"`
	Title     string `json:"title"`
	Body      string `json:"body"`
	Category  string `json:"category"`
	SortOrder int    `json:"sort_order"`
}

type TalkingPointInput struct {
	Title     string `json:"title"`
	Body      string `json:"body"      binding:"required"`
	Category  string `json:"category"`
	SortOrder int    `json:"sort_order"`
}

// ── Security incidents (the timeline) ────────────────────────────────────────

type SecurityIncident struct {
	ID          int        `json:"id"`
	Title       string     `json:"title"`
	Date        *time.Time `json:"date"`
	Description string     `json:"description"`
	SourceURL   *string    `json:"source_url"`
	FlockDenied bool       `json:"flock_denied"`
	SortOrder   int        `json:"sort_order"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type SecurityIncidentInput struct {
	Title       string  `json:"title"       binding:"required"`
	Date        *string `json:"date"`
	Description string  `json:"description" binding:"required"`
	SourceURL   *string `json:"source_url"`
	FlockDenied bool    `json:"flock_denied"`
	SortOrder   int     `json:"sort_order"`
}

// ── Security findings (CVE / vulnerability cards) ────────────────────────────

type SecurityFinding struct {
	ID        int       `json:"id"`
	Slug      string    `json:"slug"`
	Severity  string    `json:"severity"`  // "CRITICAL" | "HIGH"
	Device    string    `json:"device"`
	Title     string    `json:"title"`
	Body      string    `json:"body"`
	Source    string    `json:"source"`
	SourceURL string    `json:"source_url"`
	SortOrder int       `json:"sort_order"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type SecurityFindingInput struct {
	Slug      string `json:"slug"       binding:"required"`
	Severity  string `json:"severity"`
	Device    string `json:"device"     binding:"required"`
	Title     string `json:"title"      binding:"required"`
	Body      string `json:"body"       binding:"required"`
	Source    string `json:"source"     binding:"required"`
	SourceURL string `json:"source_url" binding:"required"`
	SortOrder int    `json:"sort_order"`
}

// ── Reps (curated ZIP-prefix → representative list) ──────────────────────────

type Rep struct {
	ID          int    `json:"id"`
	ZipPrefix   string `json:"zip_prefix"`
	Level       string `json:"level"`
	Name        string `json:"name"`
	Role        string `json:"role"`
	ContactURL  string `json:"contact_url,omitempty"`
	ContactEmail string `json:"contact_email,omitempty"`
	ContactPhone string `json:"contact_phone,omitempty"`
}

// ── helpers ──────────────────────────────────────────────────────────────────

// MarshalSources is a convenience for handlers that need to insert a []Source
// into a JSONB column. The pgx driver supports []byte directly.
func MarshalSources(s []Source) ([]byte, error) {
	if s == nil {
		return []byte("[]"), nil
	}
	return json.Marshal(s)
}

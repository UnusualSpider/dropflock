package models

import "time"

// ── API response envelope ─────────────────────────────────────────────────────

type Response struct {
	Data  any    `json:"data"`
	Error string `json:"error,omitempty"`
}

func OK(data any) Response      { return Response{Data: data} }
func Err(msg string) Response   { return Response{Error: msg} }

// ── Domain types ──────────────────────────────────────────────────────────────

type Issue struct {
	ID        int       `json:"id"`
	Slug      string    `json:"slug"`
	Title     string    `json:"title"`
	Body      string    `json:"body"`
	Category  string    `json:"category"`
	SortOrder int       `json:"sort_order"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type IssueInput struct {
	Slug      string `json:"slug"       binding:"required"`
	Title     string `json:"title"      binding:"required"`
	Body      string `json:"body"       binding:"required"`
	Category  string `json:"category"`
	SortOrder int    `json:"sort_order"`
}

type Group struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description *string   `json:"description"`
	Website     *string   `json:"website"`
	Email       *string   `json:"email"`
	City        *string   `json:"city"`
	State       string    `json:"state"`
	National    bool      `json:"national"`
	CreatedAt   time.Time `json:"created_at"`
}

type GroupInput struct {
	Name        string  `json:"name"        binding:"required"`
	Description *string `json:"description"`
	Website     *string `json:"website"`
	Email       *string `json:"email"`
	City        *string `json:"city"`
	State       string  `json:"state"       binding:"required"`
	National    bool    `json:"national"`
}

type Stat struct {
	ID     int    `json:"id"`
	Key    string `json:"key"`
	Value  string `json:"value"`
	Label  string `json:"label"`
	Source string `json:"source,omitempty"`
}

type StatInput struct {
	Key    string `json:"key"   binding:"required"`
	Value  string `json:"value" binding:"required"`
	Label  string `json:"label" binding:"required"`
	Source string `json:"source"`
}

type TalkingPoint struct {
	ID        int    `json:"id"`
	Body      string `json:"body"`
	Category  string `json:"category"`
	SortOrder int    `json:"sort_order"`
}

type TalkingPointInput struct {
	Body      string `json:"body"      binding:"required"`
	Category  string `json:"category"`
	SortOrder int    `json:"sort_order"`
}

type SecurityIncident struct {
	ID          int        `json:"id"`
	Title       string     `json:"title"`
	Date        *time.Time `json:"date"`
	Description string     `json:"description"`
	SourceURL   *string    `json:"source_url"`
	FlockDenied bool       `json:"flock_denied"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type SecurityIncidentInput struct {
	Title       string  `json:"title"       binding:"required"`
	Date        *string `json:"date"`        // YYYY-MM-DD, optional
	Description string  `json:"description" binding:"required"`
	SourceURL   *string `json:"source_url"`
	FlockDenied bool    `json:"flock_denied"`
}
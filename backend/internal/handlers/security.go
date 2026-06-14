package handlers

import (
	"net/http"
	"strconv"

	"backend/internal/db"
	"backend/internal/models"

	"github.com/gin-gonic/gin"
)

type SecurityHandler struct{ db *db.Pool }

func NewSecurityHandler(db *db.Pool) *SecurityHandler { return &SecurityHandler{db} }

// GET /api/security/incidents
//
// Returns the disclosure timeline (sorted chronologically by date, then by
// sort_order). Items with flock_denied=true are highlighted by the frontend.
func (h *SecurityHandler) ListIncidents(c *gin.Context) {
	rows, err := h.db.Query(c, `
		SELECT id, title, date, description, source_url, flock_denied, sort_order, created_at, updated_at
		FROM security_incidents
		WHERE published = true
		ORDER BY date ASC NULLS LAST, sort_order ASC, id ASC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Err("query failed: "+err.Error()))
		return
	}
	defer rows.Close()

	var items []models.SecurityIncident
	for rows.Next() {
		var s models.SecurityIncident
		var sourceURL *string
		// pgx scans a nullable DATE into *time.Time.
		if err := rows.Scan(&s.ID, &s.Title, &s.Date, &s.Description, &sourceURL, &s.FlockDenied, &s.SortOrder, &s.CreatedAt, &s.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, models.Err("scan failed: "+err.Error()))
			return
		}
		if sourceURL != nil {
			s.SourceURL = sourceURL
		}
		items = append(items, s)
	}
	c.JSON(http.StatusOK, models.OK(items))
}

// GET /api/security/findings
func (h *SecurityHandler) ListFindings(c *gin.Context) {
	rows, err := h.db.Query(c, `
		SELECT id, slug, severity, device, title, body, source, source_url, sort_order, created_at, updated_at
		FROM security_findings
		WHERE published = true
		ORDER BY sort_order ASC, id ASC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Err("query failed: "+err.Error()))
		return
	}
	defer rows.Close()

	var items []models.SecurityFinding
	for rows.Next() {
		var f models.SecurityFinding
		if err := rows.Scan(&f.ID, &f.Slug, &f.Severity, &f.Device, &f.Title, &f.Body, &f.Source, &f.SourceURL, &f.SortOrder, &f.CreatedAt, &f.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, models.Err("scan failed: "+err.Error()))
			return
		}
		items = append(items, f)
	}
	c.JSON(http.StatusOK, models.OK(items))
}

// GET /api/security/findings/:slug
func (h *SecurityHandler) GetFinding(c *gin.Context) {
	slug := c.Param("slug")
	var f models.SecurityFinding
	err := h.db.QueryRow(c, `
		SELECT id, slug, severity, device, title, body, source, source_url, sort_order, created_at, updated_at
		FROM security_findings WHERE slug = $1 AND published = true
	`, slug).Scan(&f.ID, &f.Slug, &f.Severity, &f.Device, &f.Title, &f.Body, &f.Source, &f.SourceURL, &f.SortOrder, &f.CreatedAt, &f.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusNotFound, models.Err("not found"))
		return
	}
	c.JSON(http.StatusOK, models.OK(f))
}

// POST /api/security/findings  (auth required)
func (h *SecurityHandler) CreateFinding(c *gin.Context) {
	var inp models.SecurityFindingInput
	if err := c.ShouldBindJSON(&inp); err != nil {
		c.JSON(http.StatusBadRequest, models.Err(err.Error()))
		return
	}
	if inp.Severity == "" {
		inp.Severity = "HIGH"
	}
	var id int
	err := h.db.QueryRow(c, `
		INSERT INTO security_findings (slug, severity, device, title, body, source, source_url, sort_order)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id
	`, inp.Slug, inp.Severity, inp.Device, inp.Title, inp.Body, inp.Source, inp.SourceURL, inp.SortOrder).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Err("insert failed: "+err.Error()))
		return
	}
	c.JSON(http.StatusCreated, models.OK(gin.H{"id": id}))
}

// POST /api/security/incidents  (auth required)
func (h *SecurityHandler) CreateIncident(c *gin.Context) {
	var inp models.SecurityIncidentInput
	if err := c.ShouldBindJSON(&inp); err != nil {
		c.JSON(http.StatusBadRequest, models.Err(err.Error()))
		return
	}
	var id int
	// Date is optional. We pass it through if non-nil; pgx parses ISO YYYY-MM-DD
	// into a DATE column directly.
	if inp.Date != nil && *inp.Date != "" {
		err := h.db.QueryRow(c, `
			INSERT INTO security_incidents (title, date, description, source_url, flock_denied, sort_order)
			VALUES ($1, $2::date, $3, $4, $5, $6)
			RETURNING id
		`, inp.Title, *inp.Date, inp.Description, inp.SourceURL, inp.FlockDenied, inp.SortOrder).Scan(&id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, models.Err("insert failed: "+err.Error()))
			return
		}
	} else {
		err := h.db.QueryRow(c, `
			INSERT INTO security_incidents (title, date, description, source_url, flock_denied, sort_order)
			VALUES ($1, NULL, $2, $3, $4, $5)
			RETURNING id
		`, inp.Title, inp.Description, inp.SourceURL, inp.FlockDenied, inp.SortOrder).Scan(&id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, models.Err("insert failed: "+err.Error()))
			return
		}
	}
	c.JSON(http.StatusCreated, models.OK(gin.H{"id": id}))
}

// DELETE /api/security/findings/:id  (auth required, soft delete)
func (h *SecurityHandler) DeleteFinding(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Err("invalid id"))
		return
	}
	tag, err := h.db.Exec(c, `UPDATE security_findings SET published=false WHERE id=$1`, id)
	if err != nil || tag.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, models.Err("not found"))
		return
	}
	c.JSON(http.StatusOK, models.OK(gin.H{"deleted": id}))
}

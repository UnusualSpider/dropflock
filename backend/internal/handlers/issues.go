package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"backend/internal/db"
	"backend/internal/models"

	"github.com/gin-gonic/gin"
)

type IssueHandler struct{ db *db.Pool }

func NewIssueHandler(db *db.Pool) *IssueHandler { return &IssueHandler{db} }

// GET /api/issues
func (h *IssueHandler) List(c *gin.Context) {
	rows, err := h.db.Query(c, `
		SELECT id, slug, tag, title, summary, body, sources, sort_order, created_at, updated_at
		FROM issues
		WHERE published = true
		ORDER BY sort_order ASC, id ASC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Err("query failed"))
		return
	}
	defer rows.Close()

	var issues []models.Issue
	for rows.Next() {
		var i models.Issue
		var sourcesRaw []byte
		if err := rows.Scan(&i.ID, &i.Slug, &i.Tag, &i.Title, &i.Summary, &i.Body, &sourcesRaw, &i.SortOrder, &i.CreatedAt, &i.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, models.Err("scan failed"))
			return
		}
		if len(sourcesRaw) > 0 {
			if err := json.Unmarshal(sourcesRaw, &i.Sources); err != nil {
				c.JSON(http.StatusInternalServerError, models.Err("sources decode failed"))
				return
			}
		}
		issues = append(issues, i)
	}

	c.JSON(http.StatusOK, models.OK(issues))
}

// GET /api/issues/:id
func (h *IssueHandler) Get(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Err("invalid id"))
		return
	}

	var i models.Issue
	var sourcesRaw []byte
	err = h.db.QueryRow(c, `
		SELECT id, slug, tag, title, summary, body, sources, sort_order, created_at, updated_at
		FROM issues WHERE id = $1 AND published = true
	`, id).Scan(&i.ID, &i.Slug, &i.Tag, &i.Title, &i.Summary, &i.Body, &sourcesRaw, &i.SortOrder, &i.CreatedAt, &i.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusNotFound, models.Err("not found"))
		return
	}
	if len(sourcesRaw) > 0 {
		_ = json.Unmarshal(sourcesRaw, &i.Sources)
	}

	c.JSON(http.StatusOK, models.OK(i))
}

// POST /api/issues  (auth required — mounted under admin group)
func (h *IssueHandler) Create(c *gin.Context) {
	var inp models.IssueInput
	if err := c.ShouldBindJSON(&inp); err != nil {
		c.JSON(http.StatusBadRequest, models.Err(err.Error()))
		return
	}
	if inp.Tag == "" {
		inp.Tag = "general"
	}

	sources, err := models.MarshalSources(inp.Sources)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Err("encode sources: "+err.Error()))
		return
	}

	var id int
	err = h.db.QueryRow(c, `
		INSERT INTO issues (slug, title, body, category, tag, summary, sources, sort_order)
		VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
		RETURNING id
	`, inp.Slug, inp.Title, inp.Body, inp.Tag, inp.Tag, inp.Summary, string(sources), inp.SortOrder).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Err("insert failed: "+err.Error()))
		return
	}

	c.JSON(http.StatusCreated, models.OK(gin.H{"id": id}))
}

// PUT /api/issues/:id  (auth required)
func (h *IssueHandler) Update(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Err("invalid id"))
		return
	}

	var inp models.IssueInput
	if err := c.ShouldBindJSON(&inp); err != nil {
		c.JSON(http.StatusBadRequest, models.Err(err.Error()))
		return
	}
	if inp.Tag == "" {
		inp.Tag = "general"
	}

	sources, err := models.MarshalSources(inp.Sources)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Err("encode sources: "+err.Error()))
		return
	}

	tag, err := h.db.Exec(c, `
		UPDATE issues SET slug=$1, title=$2, body=$3, category=$4, tag=$5, summary=$6, sources=$7::jsonb, sort_order=$8
		WHERE id=$9
	`, inp.Slug, inp.Title, inp.Body, inp.Tag, inp.Tag, inp.Summary, string(sources), inp.SortOrder, id)
	if err != nil || tag.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, models.Err("not found or update failed"))
		return
	}

	c.JSON(http.StatusOK, models.OK(gin.H{"updated": id}))
}

// DELETE /api/issues/:id  (auth required, soft delete — sets published=false)
func (h *IssueHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Err("invalid id"))
		return
	}

	tag, err := h.db.Exec(c, `UPDATE issues SET published=false WHERE id=$1`, id)
	if err != nil || tag.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, models.Err("not found"))
		return
	}

	c.JSON(http.StatusOK, models.OK(gin.H{"deleted": id}))
}

package handlers

import (
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
		SELECT id, slug, title, body, category, sort_order, created_at, updated_at
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
		if err := rows.Scan(&i.ID, &i.Slug, &i.Title, &i.Body, &i.Category, &i.SortOrder, &i.CreatedAt, &i.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, models.Err("scan failed"))
			return
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
	err = h.db.QueryRow(c, `
		SELECT id, slug, title, body, category, sort_order, created_at, updated_at
		FROM issues WHERE id = $1 AND published = true
	`, id).Scan(&i.ID, &i.Slug, &i.Title, &i.Body, &i.Category, &i.SortOrder, &i.CreatedAt, &i.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusNotFound, models.Err("not found"))
		return
	}

	c.JSON(http.StatusOK, models.OK(i))
}

// POST /api/issues
func (h *IssueHandler) Create(c *gin.Context) {
	var inp models.IssueInput
	if err := c.ShouldBindJSON(&inp); err != nil {
		c.JSON(http.StatusBadRequest, models.Err(err.Error()))
		return
	}

	if inp.Category == "" {
		inp.Category = "general"
	}

	var id int
	err := h.db.QueryRow(c, `
		INSERT INTO issues (slug, title, body, category, sort_order)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`, inp.Slug, inp.Title, inp.Body, inp.Category, inp.SortOrder).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Err("insert failed: "+err.Error()))
		return
	}

	c.JSON(http.StatusCreated, models.OK(gin.H{"id": id}))
}

// PUT /api/issues/:id
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

	tag, err := h.db.Exec(c, `
		UPDATE issues SET slug=$1, title=$2, body=$3, category=$4, sort_order=$5
		WHERE id=$6
	`, inp.Slug, inp.Title, inp.Body, inp.Category, inp.SortOrder, id)
	if err != nil || tag.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, models.Err("not found or update failed"))
		return
	}

	c.JSON(http.StatusOK, models.OK(gin.H{"updated": id}))
}

// DELETE /api/issues/:id  (soft delete — sets published=false)
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
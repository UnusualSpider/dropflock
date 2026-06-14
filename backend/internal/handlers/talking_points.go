package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"backend/internal/db"
	"backend/internal/models"

	"github.com/gin-gonic/gin"
)

type TalkingPointHandler struct{ db *db.Pool }

func NewTalkingPointHandler(db *db.Pool) *TalkingPointHandler {
	return &TalkingPointHandler{db}
}

// GET /api/talking-points?category=tip
//
// Filter by category if supplied. Returns all published talking points
// ordered by category, sort_order, id.
func (h *TalkingPointHandler) List(c *gin.Context) {
	category := strings.TrimSpace(c.Query("category"))
	sql := `
		SELECT id, title, body, category, sort_order
		FROM talking_points
		WHERE published = true
	`
	args := []any{}
	if category != "" {
		sql += " AND category = $1"
		args = append(args, category)
	}
	sql += " ORDER BY category ASC, sort_order ASC, id ASC"

	rows, err := h.db.Query(c, sql, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Err("query failed: "+err.Error()))
		return
	}
	defer rows.Close()

	var points []models.TalkingPoint
	for rows.Next() {
		var p models.TalkingPoint
		if err := rows.Scan(&p.ID, &p.Title, &p.Body, &p.Category, &p.SortOrder); err != nil {
			c.JSON(http.StatusInternalServerError, models.Err("scan failed: "+err.Error()))
			return
		}
		points = append(points, p)
	}

	c.JSON(http.StatusOK, models.OK(points))
}

// POST /api/talking-points  (auth required)
func (h *TalkingPointHandler) Create(c *gin.Context) {
	var inp models.TalkingPointInput
	if err := c.ShouldBindJSON(&inp); err != nil {
		c.JSON(http.StatusBadRequest, models.Err(err.Error()))
		return
	}
	if inp.Category == "" {
		inp.Category = "general"
	}
	var id int
	err := h.db.QueryRow(c, `
		INSERT INTO talking_points (title, body, category, sort_order)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`, inp.Title, inp.Body, inp.Category, inp.SortOrder).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Err("insert failed: "+err.Error()))
		return
	}
	c.JSON(http.StatusCreated, models.OK(gin.H{"id": id}))
}

// PUT /api/talking-points/:id  (auth required)
func (h *TalkingPointHandler) Update(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Err("invalid id"))
		return
	}
	var inp models.TalkingPointInput
	if err := c.ShouldBindJSON(&inp); err != nil {
		c.JSON(http.StatusBadRequest, models.Err(err.Error()))
		return
	}
	if inp.Category == "" {
		inp.Category = "general"
	}
	tag, err := h.db.Exec(c, `
		UPDATE talking_points SET title=$1, body=$2, category=$3, sort_order=$4
		WHERE id=$5
	`, inp.Title, inp.Body, inp.Category, inp.SortOrder, id)
	if err != nil || tag.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, models.Err("not found or update failed"))
		return
	}
	c.JSON(http.StatusOK, models.OK(gin.H{"updated": id}))
}

// DELETE /api/talking-points/:id  (auth required, soft delete)
func (h *TalkingPointHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Err("invalid id"))
		return
	}
	tag, err := h.db.Exec(c, `UPDATE talking_points SET published=false WHERE id=$1`, id)
	if err != nil || tag.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, models.Err("not found"))
		return
	}
	c.JSON(http.StatusOK, models.OK(gin.H{"deleted": id}))
}

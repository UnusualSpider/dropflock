package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"backend/internal/db"
	"backend/internal/models"

	"github.com/gin-gonic/gin"
)

type StatHandler struct{ db *db.Pool }

func NewStatHandler(db *db.Pool) *StatHandler { return &StatHandler{db} }

// GET /api/stats?key=home.cities
//
// Returns stats filtered by exact key match if `key` is supplied; otherwise
// returns all stats. Multiple `key` query params are supported.
func (h *StatHandler) List(c *gin.Context) {
	keys := c.QueryArray("key")
	keys = removeEmpty(keys)

	sql := `
		SELECT id, key, value, label, source, emphasis, sort_order, updated_at
		FROM stats
	`
	args := []any{}
	if len(keys) > 0 {
		sql += " WHERE key = ANY($1)"
		args = append(args, keys)
	}
	sql += " ORDER BY sort_order ASC, id ASC"

	rows, err := h.db.Query(c, sql, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Err("query failed: "+err.Error()))
		return
	}
	defer rows.Close()

	var stats []models.Stat
	for rows.Next() {
		var s models.Stat
		var source *string
		if err := rows.Scan(&s.ID, &s.Key, &s.Value, &s.Label, &source, &s.Emphasis, &s.SortOrder, &s.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, models.Err("scan failed: "+err.Error()))
			return
		}
		if source != nil {
			s.Source = *source
		}
		stats = append(stats, s)
	}

	c.JSON(http.StatusOK, models.OK(stats))
}

// POST /api/stats  (auth required)
func (h *StatHandler) Create(c *gin.Context) {
	var inp models.StatInput
	if err := c.ShouldBindJSON(&inp); err != nil {
		c.JSON(http.StatusBadRequest, models.Err(err.Error()))
		return
	}
	if inp.Emphasis == "" {
		inp.Emphasis = "normal"
	}
	var id int
	err := h.db.QueryRow(c, `
		INSERT INTO stats (key, value, label, source, emphasis, sort_order)
		VALUES ($1, $2, $3, NULLIF($4, ''), $5, $6)
		RETURNING id
	`, inp.Key, inp.Value, inp.Label, inp.Source, inp.Emphasis, inp.SortOrder).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Err("insert failed: "+err.Error()))
		return
	}
	c.JSON(http.StatusCreated, models.OK(gin.H{"id": id}))
}

// PUT /api/stats/:id  (auth required)
func (h *StatHandler) Update(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Err("invalid id"))
		return
	}
	var inp models.StatInput
	if err := c.ShouldBindJSON(&inp); err != nil {
		c.JSON(http.StatusBadRequest, models.Err(err.Error()))
		return
	}
	if inp.Emphasis == "" {
		inp.Emphasis = "normal"
	}
	tag, err := h.db.Exec(c, `
		UPDATE stats SET key=$1, value=$2, label=$3, source=NULLIF($4, ''), emphasis=$5, sort_order=$6
		WHERE id=$7
	`, inp.Key, inp.Value, inp.Label, inp.Source, inp.Emphasis, inp.SortOrder, id)
	if err != nil || tag.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, models.Err("not found or update failed"))
		return
	}
	c.JSON(http.StatusOK, models.OK(gin.H{"updated": id}))
}

// DELETE /api/stats/:id  (auth required)
func (h *StatHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Err("invalid id"))
		return
	}
	tag, err := h.db.Exec(c, `DELETE FROM stats WHERE id=$1`, id)
	if err != nil || tag.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, models.Err("not found"))
		return
	}
	c.JSON(http.StatusOK, models.OK(gin.H{"deleted": id}))
}

func removeEmpty(s []string) []string {
	out := s[:0]
	for _, v := range s {
		if strings.TrimSpace(v) != "" {
			out = append(out, v)
		}
	}
	return out
}

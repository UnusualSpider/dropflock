package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"backend/internal/db"
	"backend/internal/models"

	"github.com/gin-gonic/gin"
)

type GroupHandler struct{ db *db.Pool }

func NewGroupHandler(db *db.Pool) *GroupHandler { return &GroupHandler{db} }

// GET /api/groups?scope=National&focus=Legal,Organizing&q=eugene
//
// Filter params (all optional):
//   scope   — exact match on the scope column ("National" | "State" | "Local")
//   focus   — comma-separated list; the returned group must have ALL listed focuses
//   q       — free-text match on name, location, or description (case-insensitive)
func (h *GroupHandler) List(c *gin.Context) {
	scope := strings.TrimSpace(c.Query("scope"))
	q := strings.TrimSpace(c.Query("q"))
	focusCSV := strings.TrimSpace(c.Query("focus"))
	var focus []string
	if focusCSV != "" {
		for _, f := range strings.Split(focusCSV, ",") {
			if t := strings.TrimSpace(f); t != "" {
				focus = append(focus, t)
			}
		}
	}

	sql := `
		SELECT id, slug, name, scope, focus, location, lat, lng, url, win, sort_order, created_at, updated_at
		FROM groups
		WHERE published = true
	`
	args := []any{}
	idx := 1
	if scope != "" {
		sql += " AND scope = $" + strconv.Itoa(idx)
		args = append(args, scope)
		idx++
	}
	for _, f := range focus {
		sql += " AND $" + strconv.Itoa(idx) + " = ANY(focus)"
		args = append(args, f)
		idx++
	}
	if q != "" {
		sql += " AND (name ILIKE $" + strconv.Itoa(idx) +
			" OR COALESCE(location, '') ILIKE $" + strconv.Itoa(idx) +
			" OR COALESCE(description, '') ILIKE $" + strconv.Itoa(idx) + ")"
		args = append(args, "%"+q+"%")
		idx++
	}
	sql += " ORDER BY sort_order ASC, id ASC"

	rows, err := h.db.Query(c, sql, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Err("query failed: "+err.Error()))
		return
	}
	defer rows.Close()

	var groups []models.Group
	for rows.Next() {
		var g models.Group
		var slug *string
		var location *string
		var url *string
		var win *string
		var focusRaw []byte
		if err := rows.Scan(&g.ID, &slug, &g.Name, &g.Scope, &focusRaw, &location, &g.Lat, &g.Lng, &url, &win, &g.SortOrder, &g.CreatedAt, &g.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, models.Err("scan failed: "+err.Error()))
			return
		}
		if slug != nil {
			g.Slug = *slug
		}
		if location != nil {
			g.Location = *location
		}
		if url != nil {
			g.URL = *url
		}
		if win != nil {
			g.Win = *win
		}
		if len(focusRaw) > 0 {
			_ = json.Unmarshal(focusRaw, &g.Focus)
		}
		groups = append(groups, g)
	}

	c.JSON(http.StatusOK, models.OK(groups))
}

// GET /api/groups/:id  — fetches by integer id or slug.
func (h *GroupHandler) Get(c *gin.Context) {
	param := c.Param("id")
	var g models.Group
	var slug, location, url, win *string
	var focusRaw []byte
	var err error

	if id, convErr := strconv.Atoi(param); convErr == nil {
		err = h.db.QueryRow(c, `
			SELECT id, slug, name, scope, focus, location, lat, lng, url, win, sort_order, created_at, updated_at
			FROM groups WHERE id = $1 AND published = true
		`, id).Scan(&g.ID, &slug, &g.Name, &g.Scope, &focusRaw, &location, &g.Lat, &g.Lng, &url, &win, &g.SortOrder, &g.CreatedAt, &g.UpdatedAt)
	} else {
		err = h.db.QueryRow(c, `
			SELECT id, slug, name, scope, focus, location, lat, lng, url, win, sort_order, created_at, updated_at
			FROM groups WHERE slug = $1 AND published = true
		`, param).Scan(&g.ID, &slug, &g.Name, &g.Scope, &focusRaw, &location, &g.Lat, &g.Lng, &url, &win, &g.SortOrder, &g.CreatedAt, &g.UpdatedAt)
	}
	if err != nil {
		c.JSON(http.StatusNotFound, models.Err("not found"))
		return
	}
	if slug != nil {
		g.Slug = *slug
	}
	if location != nil {
		g.Location = *location
	}
	if url != nil {
		g.URL = *url
	}
	if win != nil {
		g.Win = *win
	}
	if len(focusRaw) > 0 {
		_ = json.Unmarshal(focusRaw, &g.Focus)
	}

	c.JSON(http.StatusOK, models.OK(g))
}

// POST /api/groups  (auth required)
//
// Accepts a public GroupInput (no auth check inside the handler — the admin
// middleware does that). The new group is created with published=true so it
// shows up immediately. If an operator wants a moderation step, flip the
// default in the INSERT to false.
func (h *GroupHandler) Create(c *gin.Context) {
	var inp models.GroupInput
	if err := c.ShouldBindJSON(&inp); err != nil {
		c.JSON(http.StatusBadRequest, models.Err(err.Error()))
		return
	}
	if inp.Scope == "" {
		inp.Scope = "Local"
	}
	if len(inp.Focus) == 0 {
		inp.Focus = []string{"Organizing"}
	}
	focus, err := json.Marshal(inp.Focus)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Err("encode focus: "+err.Error()))
		return
	}

	var id int
	err = h.db.QueryRow(c, `
		INSERT INTO groups (slug, name, scope, focus, location, url, email, win, sort_order, national, state, published)
		VALUES (
			NULLIF($1, ''), $2, $3, $4::text[], NULLIF($5, ''), NULLIF($6, ''),
			NULLIF($7, ''), NULLIF($8, ''), $9,
			$10, COALESCE(NULLIF($11, ''), 'XX'), true
		)
		RETURNING id
	`,
		inp.Slug, inp.Name, inp.Scope, string(focus), inp.Location, inp.URL,
		inp.Email, inp.Win, inp.SortOrder,
		inp.Scope == "National",
		stateFromLocation(inp.Location),
	).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Err("insert failed: "+err.Error()))
		return
	}

	c.JSON(http.StatusCreated, models.OK(gin.H{"id": id}))
}

// PUT /api/groups/:id  (auth required)
func (h *GroupHandler) Update(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Err("invalid id"))
		return
	}
	var inp models.GroupInput
	if err := c.ShouldBindJSON(&inp); err != nil {
		c.JSON(http.StatusBadRequest, models.Err(err.Error()))
		return
	}
	if inp.Scope == "" {
		inp.Scope = "Local"
	}
	focus, err := json.Marshal(inp.Focus)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Err("encode focus: "+err.Error()))
		return
	}
	tag, err := h.db.Exec(c, `
		UPDATE groups
		SET slug=NULLIF($1, ''), name=$2, scope=$3, focus=$4::text[],
		    location=NULLIF($5, ''), url=NULLIF($6, ''),
		    email=NULLIF($7, ''), win=NULLIF($8, ''),
		    sort_order=$9, national=$10, state=COALESCE(NULLIF($11, ''), state)
		WHERE id=$12
	`, inp.Slug, inp.Name, inp.Scope, string(focus), inp.Location, inp.URL,
		inp.Email, inp.Win, inp.SortOrder,
		inp.Scope == "National", stateFromLocation(inp.Location), id)
	if err != nil || tag.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, models.Err("not found or update failed"))
		return
	}
	c.JSON(http.StatusOK, models.OK(gin.H{"updated": id}))
}

// DELETE /api/groups/:id  (auth required, soft delete)
func (h *GroupHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Err("invalid id"))
		return
	}
	tag, err := h.db.Exec(c, `UPDATE groups SET published=false WHERE id=$1`, id)
	if err != nil || tag.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, models.Err("not found"))
		return
	}
	c.JSON(http.StatusOK, models.OK(gin.H{"deleted": id}))
}

// stateFromLocation extracts the trailing 2-letter state from "City, ST".
// Returns "" if the input doesn't match that pattern.
func stateFromLocation(loc string) string {
	for i := len(loc) - 1; i >= 0; i-- {
		if loc[i] == ',' {
			s := strings.TrimSpace(loc[i+1:])
			if len(s) == 2 {
				return strings.ToUpper(s)
			}
			return ""
		}
	}
	return ""
}

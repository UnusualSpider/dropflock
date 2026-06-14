package handlers

import (
	"net/http"
	"strings"

	"backend/internal/db"
	"backend/internal/models"

	"github.com/gin-gonic/gin"
)

type RepHandler struct{ db *db.Pool }

func NewRepHandler(db *db.Pool) *RepHandler { return &RepHandler{db} }

// GET /api/reps?zip=02139
//
// Returns representatives for the first 3 characters of the supplied ZIP
// (i.e. the ZIP "prefix"). The lookup is a curated dataset in the `reps`
// table — see backend/internal/db/seed.go. Always returns the national
// fallback (zip_prefix='000') in addition to the prefix-specific rows, so
// users with unknown ZIPs still see something useful.
//
// ZIPs shorter than 3 chars or non-digit characters are rejected.
func (h *RepHandler) List(c *gin.Context) {
	zip := strings.TrimSpace(c.Query("zip"))
	zip = strings.TrimPrefix(zip, "\"")
	zip = strings.TrimSuffix(zip, "\"")
	if len(zip) < 3 {
		c.JSON(http.StatusBadRequest, models.Err("zip must be at least 3 characters"))
		return
	}
	for _, ch := range zip {
		if ch < '0' || ch > '9' {
			c.JSON(http.StatusBadRequest, models.Err("zip must be digits only"))
			return
		}
	}
	prefix := zip[:3]

	rows, err := h.db.Query(c, `
		SELECT id, zip_prefix, level, name, role, contact_url, contact_email, contact_phone
		FROM reps
		WHERE zip_prefix IN ($1, '000')
		ORDER BY CASE WHEN zip_prefix = $1 THEN 0 ELSE 1 END, level, role, name
	`, prefix)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Err("query failed: "+err.Error()))
		return
	}
	defer rows.Close()

	var reps []models.Rep
	for rows.Next() {
		var r models.Rep
		var contactURL, contactEmail, contactPhone *string
		if err := rows.Scan(&r.ID, &r.ZipPrefix, &r.Level, &r.Name, &r.Role, &contactURL, &contactEmail, &contactPhone); err != nil {
			c.JSON(http.StatusInternalServerError, models.Err("scan failed: "+err.Error()))
			return
		}
		if contactURL != nil {
			r.ContactURL = *contactURL
		}
		if contactEmail != nil {
			r.ContactEmail = *contactEmail
		}
		if contactPhone != nil {
			r.ContactPhone = *contactPhone
		}
		reps = append(reps, r)
	}

	c.JSON(http.StatusOK, models.OK(reps))
}

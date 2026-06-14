package handlers

import (
	"os"
	"strings"

	"backend/internal/models"

	"github.com/gin-gonic/gin"
)

// AuthRequired returns a Gin middleware that rejects requests without a
// matching `Authorization: Bearer <token>` header. The expected token is
// read from the ADMIN_TOKEN environment variable at request time (not at
// startup) so the operator can rotate it without restarting the server
// (provided the new value reaches the process via a secret reload — for
// the K8s deployment we just restart the pod on secret change).
//
// Behavior:
//   - ADMIN_TOKEN unset → 500 ("server not configured for admin writes").
//     We refuse rather than fall through to allow writes unauthenticated.
//   - Header missing or wrong → 401 ("unauthorized").
//   - Correct → continue.
func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		expected := os.Getenv("ADMIN_TOKEN")
		if expected == "" {
			c.AbortWithStatusJSON(500, models.Err("server not configured for admin writes"))
			return
		}
		auth := c.GetHeader("Authorization")
		const prefix = "Bearer "
		if !strings.HasPrefix(auth, prefix) {
			c.AbortWithStatusJSON(401, models.Err("unauthorized"))
			return
		}
		got := strings.TrimPrefix(auth, prefix)
		if got != expected {
			c.AbortWithStatusJSON(401, models.Err("unauthorized"))
			return
		}
		c.Next()
	}
}

package main

import (
	"context"
	"log"
	"net/http"

	"backend/internal/config"
	"backend/internal/db"
	"backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	pool, err := db.Connect(context.Background(), cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("db: %v", err)
	}
	defer pool.Close()

	if err := pool.Migrate(context.Background()); err != nil {
		log.Fatalf("migrate: %v", err)
	}

	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())

	// Health
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "pong"})
	})

	// Public reads
	issues := handlers.NewIssueHandler(pool)
	groups := handlers.NewGroupHandler(pool)
	stats := handlers.NewStatHandler(pool)
	tps := handlers.NewTalkingPointHandler(pool)
	sec := handlers.NewSecurityHandler(pool)
	reps := handlers.NewRepHandler(pool)

	api := r.Group("/api")
	{
		// Issues
		api.GET("/issues", issues.List)
		api.GET("/issues/:id", issues.Get)

		// Groups — list supports ?scope, ?focus, ?q query params
		api.GET("/groups", groups.List)
		api.GET("/groups/:id", groups.Get)

		// Stats
		api.GET("/stats", stats.List)

		// Talking points
		api.GET("/talking-points", tps.List)

		// Security
		api.GET("/security/incidents", sec.ListIncidents)
		api.GET("/security/findings", sec.ListFindings)
		api.GET("/security/findings/:slug", sec.GetFinding)

		// Reps
		api.GET("/reps", reps.List)
	}

	// Admin (auth required) — every write goes through AuthRequired()
	admin := api.Group("")
	admin.Use(handlers.AuthRequired())
	{
		admin.POST("/issues", issues.Create)
		admin.PUT("/issues/:id", issues.Update)
		admin.DELETE("/issues/:id", issues.Delete)

		admin.POST("/groups", groups.Create)
		admin.PUT("/groups/:id", groups.Update)
		admin.DELETE("/groups/:id", groups.Delete)

		admin.POST("/stats", stats.Create)
		admin.PUT("/stats/:id", stats.Update)
		admin.DELETE("/stats/:id", stats.Delete)

		admin.POST("/talking-points", tps.Create)
		admin.PUT("/talking-points/:id", tps.Update)
		admin.DELETE("/talking-points/:id", tps.Delete)

		admin.POST("/security/incidents", sec.CreateIncident)
		admin.POST("/security/findings", sec.CreateFinding)
		admin.DELETE("/security/findings/:id", sec.DeleteFinding)
	}

	log.Printf("starting on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("server: %v", err)
	}
}

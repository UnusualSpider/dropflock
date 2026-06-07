package main

import (
	"context"
	"log"

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

	pool, err := db.Connect(context.Background(), cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("db: %v", err)
	}
	defer pool.Close()

	if err := pool.Migrate(context.Background()); err != nil {
		log.Fatalf("migrate: %v", err)
	}

	r := gin.Default()

	issues := handlers.NewIssueHandler(pool)
	api := r.Group("/api")
	{
		api.GET("/issues", issues.List)
		api.GET("/issues/:id", issues.Get)
		api.POST("/issues", issues.Create)
		api.PUT("/issues/:id", issues.Update)
		api.DELETE("/issues/:id", issues.Delete)
	}

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

	log.Printf("starting on :%s", cfg.Port)
	r.Run(":" + cfg.Port)
}
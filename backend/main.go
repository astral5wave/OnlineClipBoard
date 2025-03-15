package main

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
)

var ctx = context.Background()
var redisClient *redis.Client

func initRedis() {
	redisURL := os.Getenv("REDIS_URL")
	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Fatalf("Failed to parse Redis URL: %v", err)
	}
	redisClient = redis.NewClient(opt)

	// Test Redis connection
	err = redisClient.Set(ctx, "foo", "bar", 0).Err()
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}

	val, err := redisClient.Get(ctx, "foo").Result()
	if err != nil {
		log.Fatalf("Redis GET failed: %v", err)
	}
	fmt.Println("Redis Connected Successfully! Test Key Value:", val)
}

// Generate a unique 6-character alphanumeric key
func generateUniqueKey() (string, error) {
	for {
		b := make([]byte, 3)
		_, err := rand.Read(b)
		if err != nil {
			return "", err
		}
		key := hex.EncodeToString(b)

		// Check if key already exists
		exists, err := redisClient.Exists(ctx, key).Result()
		if err != nil {
			log.Println("Redis error while checking key existence:", err)
			return "", err
		}
		if exists == 0 {
			return key, nil
		}
	}
}

func main() {
	// err := godotenv.Load()
	// if err != nil {
	// 	log.Fatal("Error loading .env file")
	// }

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Default to 8080 if no port is set
	}

	backendURL := os.Getenv("BACKEND_URL")
	if backendURL == "" {
		backendURL = "http://localhost:" + port
	}

	initRedis()
	app := fiber.New()

	// Enable CORS
	app.Use(func(c *fiber.Ctx) error {
		frontendURL := os.Getenv("FRONTEND_URL")
		if frontendURL == "" {
			frontendURL = "*" // Default to allow all if FRONTEND_URL is not set
		}

		c.Set("Access-Control-Allow-Origin", frontendURL)
		c.Set("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
		c.Set("Access-Control-Allow-Headers", "Content-Type")

		if c.Method() == "OPTIONS" {
			return c.SendStatus(200)
		}

		return c.Next()
	})

	// Save clipboard data
	app.Post("/save", func(c *fiber.Ctx) error {
		var req struct {
			Value string `json:"value"`
		}

		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
		}
		trimmedValue := strings.TrimSpace(req.Value)
		if trimmedValue == "" {
			return c.Status(400).JSON(fiber.Map{"error": "Value cannot be empty"})
		}
		key, err := generateUniqueKey()
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to generate key"})
		}

		// Store data in Redis with a TTL of 10 minutes
		err = redisClient.Set(ctx, key, trimmedValue, 10*time.Minute).Err()
		if err != nil {
			log.Println("Redis error while saving data:", err)
			return c.Status(500).JSON(fiber.Map{"error": "Failed to save data"})
		}

		return c.JSON(fiber.Map{"message": "Saved successfully", "key": key})
	})

	// Retrieve clipboard data
	app.Get("/get/:key", func(c *fiber.Ctx) error {
		key := strings.TrimSpace(c.Params("key"))

		if key == "" {
			return c.Status(400).JSON(fiber.Map{"error": "Key cannot be empty"})
		}

		value, err := redisClient.Get(ctx, key).Result()
		if err == redis.Nil {
			return c.Status(404).JSON(fiber.Map{"error": "Invalid Key"}) // when key not found
		} else if err != nil {
			log.Println("Redis error while retrieving data:", err)
			return c.Status(500).JSON(fiber.Map{"error": "Server error"})
		}

		return c.JSON(fiber.Map{"data": value})
	})

	fmt.Println("Server running at:", backendURL)
	log.Fatal(app.Listen(":" + port))
}

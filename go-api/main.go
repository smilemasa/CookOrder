// Package main CookOrder API
//
// @title CookOrder API
// @version 1.0
// @description API for searching dishes
// @host localhost:8080
// @BasePath /
package main

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"

	"cloud.google.com/go/storage"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	dishes "github.com/smilemasa/go-api/handler/admin/dishes"
)

// CORS middleware
func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		// Handle preflight requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

func init() {
	// .envファイルを読み込む
	if err := godotenv.Load(); err != nil {
		fmt.Println("Error loading .env file")
	}
}

func uploadHandler(w http.ResponseWriter, r *http.Request) {
	// POSTメソッドのみ許可
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// 環境変数からバケット名を取得
	bucketName := os.Getenv("GCS_BUCKET_NAME")
	if bucketName == "" {
		http.Error(w, "GCS_BUCKET_NAME is not set in environment variables", http.StatusInternalServerError)
		return
	}

	// ファイルを取得
	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Failed to get file from request", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// ユニークなファイル名を生成
	uniqueFileName := fmt.Sprintf("%s_%s", uuid.New().String(), header.Filename)

	// GCSにアップロード
	ctx := context.Background()
	client, err := storage.NewClient(ctx)
	if err != nil {
		http.Error(w, "Failed to create GCS client", http.StatusInternalServerError)
		return
	}
	defer client.Close()

	// バケットにファイルをアップロード
	bucket := client.Bucket(bucketName)
	object := bucket.Object(uniqueFileName)
	writer := object.NewWriter(ctx)
	if _, err := io.Copy(writer, file); err != nil {
		http.Error(w, "Failed to upload file to GCS", http.StatusInternalServerError)
		return
	}
	if err := writer.Close(); err != nil {
		http.Error(w, "Failed to finalize file upload to GCS", http.StatusInternalServerError)
		return
	}

	// レスポンス
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "File uploaded successfully to GCS: %s", uniqueFileName)
}

func main() {
	http.HandleFunc("/dishes", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			dishes.PostDish(w, r)
		case http.MethodGet:
			dishes.AdminGetDishes(w, r)
		default:
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}
	}))

	http.HandleFunc("/dishes/search", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			dishes.SearchDishes(w, r)
		default:
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}
	}))

	http.HandleFunc("/dishes/{id}", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPut:
			dishes.PutDish(w, r)
		case http.MethodDelete:
			dishes.DeleteDish(w, r)
		default:
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}
	}))

	http.HandleFunc("/upload", uploadHandler)

	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server started at :%s\n", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		fmt.Println("Failed to start server:", err)
	}
}

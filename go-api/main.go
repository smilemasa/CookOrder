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
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"github.com/smilemasa/go-api/config"
	dishes "github.com/smilemasa/go-api/handler/admin/dishes"
	"github.com/smilemasa/go-api/utils"
)

func main() {
	// 設定を読み込む
	cfg, err := config.Load()
	if err != nil {
		fmt.Printf("Failed to load configuration: %v\n", err)
		os.Exit(1)
	}

	// GCSクライアントを初期化
	ctx := context.Background()
	if err := utils.InitGCSClient(ctx, cfg.GCS.BucketName); err != nil {
		fmt.Printf("Failed to initialize GCS client: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("GCS client initialized successfully")

	// アプリケーション終了時にGCSクライアントを閉じる
	defer func() {
		if err := utils.Close(); err != nil {
			fmt.Printf("Error closing GCS client: %v\n", err)
		}
	}()

	r := mux.NewRouter()

	// CORS設定 - 本番環境では適切なオリジンを設定
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"}, // 開発環境用
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
		Debug:            true, // 開発時のみ
	})

	// CORSミドルウェアを適用
	handler := c.Handler(r)

	// Routes
	r.HandleFunc("/dishes", dishes.PostDish).Methods("POST")
	r.HandleFunc("/dishes", dishes.AdminGetDishes).Methods("GET")

	r.HandleFunc("/dishes/search", dishes.SearchDishes).Methods("GET")

	r.HandleFunc("/dishes/{id}", dishes.PutDish).Methods("PUT")
	r.HandleFunc("/dishes/{id}", dishes.DeleteDish).Methods("DELETE")

	fmt.Println("🚀 Listening on http://localhost:8080")
	http.ListenAndServe(":8080", handler)
}

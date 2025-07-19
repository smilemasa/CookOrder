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
	"strings"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
	"github.com/smilemasa/go-api/config"
	"github.com/smilemasa/go-api/db"
	dishes "github.com/smilemasa/go-api/handler/admin/dishes"
	"github.com/smilemasa/go-api/utils"
)

func init() {
	// .envファイルを読み込む
	if err := godotenv.Load(); err != nil {
		fmt.Println("Error loading .env file")
	}
}

func main() {
	// 設定を読み込む
	cfg, err := config.Load()
	if err != nil {
		fmt.Printf("Failed to load config: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("Config loaded successfully")

	// データベース疎通確認
	if err := db.TestConnection(); err != nil {
		fmt.Printf("❌ データベース疎通確認失敗: %v\n", err)
		fmt.Println("アプリケーションを終了します")
		os.Exit(1)
	}

	// GCSクライアントを初期化
	bucketName := cfg.GCS.BucketName
	if bucketName == "" {
		fmt.Println("Warning: GCS_BUCKET_NAME not set in configuration")
	} else {
		ctx := context.Background()
		if err := utils.InitGCSClient(ctx, bucketName); err != nil {
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
	}

	r := mux.NewRouter()

	// CORS設定 - 環境変数から設定を取得
	allowedOrigins := getCORSOrigins()
	isDevelopment := os.Getenv("ENVIRONMENT") != "production"
	fmt.Printf("CORS allowed origins: %v\n", allowedOrigins)
	c := cors.New(cors.Options{
		AllowedOrigins: allowedOrigins,
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{
			"Accept",
			"Authorization",
			"Content-Type",
			"X-CSRF-Token",
			"X-Requested-With",
		},
		AllowCredentials: true,
		Debug:            isDevelopment, // 開発環境でのみデバッグ有効
	})

	// CORSミドルウェアを適用
	handler := c.Handler(r)

	// Routes
	r.HandleFunc("/dishes", dishes.PostDish).Methods("POST")
	r.HandleFunc("/dishes", dishes.AdminGetDishes).Methods("GET")

	r.HandleFunc("/dishes/search", dishes.SearchDishes).Methods("GET")

	r.HandleFunc("/dishes/{id}", dishes.AdminGetDish).Methods("GET")
	r.HandleFunc("/dishes/{id}", dishes.PutDish).Methods("PUT")
	r.HandleFunc("/dishes/{id}", dishes.DeleteDish).Methods("DELETE")

	fmt.Println("🚀 Listening on http://localhost:8080")
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // ローカル用のデフォルト
	}
	http.ListenAndServe(":"+port, handler)
}

// getCORSOrigins 環境変数からCORSの許可オリジンを取得
func getCORSOrigins() []string {
	// 環境変数からオリジンを取得（カンマ区切り）
	originsEnv := os.Getenv("CORS_ALLOWED_ORIGINS")

	// 環境変数が設定されていない場合のデフォルト値
	if originsEnv == "" {
		environment := os.Getenv("ENVIRONMENT")
		if environment == "production" {
			// 本番環境のデフォルト（実際のドメインに変更してください）
			return []string{
				"https://your-production-domain.com",
				"https://www.your-production-domain.com",
			}
		} else {
			// 開発環境のデフォルト
			return []string{
				"http://localhost:3000",
				"http://localhost:3001",
				"http://127.0.0.1:3000",
			}
		}
	}

	// カンマ区切りの文字列をスライスに変換
	origins := strings.Split(originsEnv, ",")
	for i, origin := range origins {
		origins[i] = strings.TrimSpace(origin)
	}

	return origins
}

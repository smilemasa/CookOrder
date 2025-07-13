package config

import (
	"fmt"
	"os"
	"strconv"
	"sync"

	"github.com/joho/godotenv"
)

// Config アプリケーション設定
type Config struct {
	// Database設定
	DB struct {
		Host     string
		Port     int
		User     string
		Password string
		Database string
	}

	// GCS設定
	GCS struct {
		BucketName string
	}
}

var (
	config *Config
	once   sync.Once
)

// Load 設定を読み込む（一度だけ実行される）
func Load() (*Config, error) {
	var err error
	once.Do(func() {
		// 開発環境でのみ.envファイルを読み込む
		// Cloud Runなどの本番環境では環境変数が直接設定される
		if os.Getenv("ENVIRONMENT") != "production" {
			if loadErr := godotenv.Load(); loadErr != nil {
				fmt.Printf("Info: .env file not found (this is normal in production): %v\n", loadErr)
			}
		}

		config = &Config{}

		// Database設定
		config.DB.Host = os.Getenv("PG_HOST")
		config.DB.User = os.Getenv("PG_USER")
		config.DB.Password = os.Getenv("PG_PASSWORD")
		config.DB.Database = os.Getenv("PG_DATABASE")

		portStr := os.Getenv("PG_PORT")
		if portStr != "" {
			config.DB.Port, _ = strconv.Atoi(portStr)
		} else {
			config.DB.Port = 5432 // デフォルトポート
		}

		// GCS設定
		config.GCS.BucketName = os.Getenv("GCS_BUCKET_NAME")

		// 必須設定のバリデーション
		var missingVars []string

		if config.GCS.BucketName == "" {
			missingVars = append(missingVars, "GCS_BUCKET_NAME")
		}

		if config.DB.Host == "" {
			missingVars = append(missingVars, "PG_HOST")
		}
		if config.DB.User == "" {
			missingVars = append(missingVars, "PG_USER")
		}
		if config.DB.Database == "" {
			missingVars = append(missingVars, "PG_DATABASE")
		}

		if len(missingVars) > 0 {
			err = fmt.Errorf("missing required environment variables: %v", missingVars)
			return
		}
	})

	return config, err
}

// Get 初期化済みの設定を取得
func Get() *Config {
	if config == nil {
		panic("Config not loaded. Call Load() first")
	}
	return config
}

// GetDatabaseDSN データベース接続文字列を取得
func (c *Config) GetDatabaseDSN() string {
	return fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		c.DB.Host,
		c.DB.Port,
		c.DB.User,
		c.DB.Password,
		c.DB.Database,
	)
}

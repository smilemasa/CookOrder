package db

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/smilemasa/go-api/config"
)

func ConnectDB() (*pgx.Conn, error) {
	cfg := config.Get()

	conn, err := pgx.Connect(context.Background(), cfg.GetDatabaseDSN())
	fmt.Printf("Connecting to database at %s:%d\n", cfg.DB.Host, cfg.DB.Port)
	if err != nil {
		return nil, fmt.Errorf("データベース接続失敗: %v", err)
	}

	return conn, nil
}

// TestConnection データベースとの疎通確認を行う
func TestConnection() error {
	cfg := config.Get()

	fmt.Printf("データベース疎通確認を開始します...\n")
	fmt.Printf("接続先: %s:%d (データベース: %s)\n", cfg.DB.Host, cfg.DB.Port, cfg.DB.Database)

	// タイムアウト付きのコンテキストを作成（10秒）
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// データベースに接続
	conn, err := pgx.Connect(ctx, cfg.GetDatabaseDSN())
	if err != nil {
		return fmt.Errorf("データベース接続失敗: %w", err)
	}
	defer conn.Close(ctx)

	// 接続確認のための簡単なクエリを実行
	var result int
	err = conn.QueryRow(ctx, "SELECT 1").Scan(&result)
	if err != nil {
		return fmt.Errorf("データベースクエリ実行失敗: %w", err)
	}

	if result != 1 {
		return fmt.Errorf("データベースクエリ結果が期待値と異なります: expected 1, got %d", result)
	}

	fmt.Printf("✅ データベース疎通確認成功\n")
	return nil
}

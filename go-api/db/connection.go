package db

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/smilemasa/go-api/config"
)

func ConnectDB() (*pgx.Conn, error) {
	cfg := config.Get()

	conn, err := pgx.Connect(context.Background(), cfg.GetDatabaseDSN())
	if err != nil {
		return nil, fmt.Errorf("データベース接続失敗: %v", err)
	}

	return conn, nil
}

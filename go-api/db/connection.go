package db

import (
	"context"
	"fmt"
	"os"
	"strconv"

	"github.com/jackc/pgx/v5"
	"github.com/joho/godotenv"
)

func ConnectDB() (*pgx.Conn, error) {
	err := godotenv.Load()
	if err != nil {
		return nil, fmt.Errorf(".env 読み込み失敗: %v", err)
	}

	port, _ := strconv.Atoi(os.Getenv("PG_PORT"))

	conn, err := pgx.Connect(context.Background(), fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("PG_HOST"),
		port,
		os.Getenv("PG_USER"),
		os.Getenv("PG_PASSWORD"),
		os.Getenv("PG_DATABASE"),
	))

	return conn, err
}

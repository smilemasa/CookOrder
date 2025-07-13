package utils

import (
	"context"
	"fmt"
	"sync"
	"time"

	"cloud.google.com/go/storage"
)

// GCSClient Google Cloud Storage クライアント
type GCSClient struct {
	client     *storage.Client
	bucketName string
}

var (
	gcsInstance *GCSClient
	gcsOnce     sync.Once
	gcsErr      error
)

// InitGCSClient GCSクライアントを初期化（一度だけ実行される）
func InitGCSClient(ctx context.Context, bucketName string) error {
	gcsOnce.Do(func() {
		client, err := storage.NewClient(ctx)
		if err != nil {
			gcsErr = fmt.Errorf("failed to create storage client: %w", err)
			return
		}

		gcsInstance = &GCSClient{
			client:     client,
			bucketName: bucketName,
		}
	})
	return gcsErr
}

// GetGCSClient 初期化済みのGCSクライアントを取得
func GetGCSClient() (*GCSClient, error) {
	if gcsInstance == nil {
		return nil, fmt.Errorf("GCS client not initialized. Call InitGCSClient first")
	}
	return gcsInstance, nil
}

// Close グローバルGCSクライアントを閉じる
func Close() error {
	if gcsInstance != nil && gcsInstance.client != nil {
		return gcsInstance.client.Close()
	}
	return nil
}

// CreateSignedURL ファイルアップロード用のSignedURLを作成
func (g *GCSClient) CreateSignedURL(ctx context.Context, objectName string, expiration time.Duration) (string, error) {
	// Pre-signed URLの設定
	opts := &storage.SignedURLOptions{
		Scheme: storage.SigningSchemeV4,
		Method: "PUT",
		Headers: []string{
			"Content-Type",
		},
		Expires: time.Now().Add(expiration),
	}

	// Signed URLを生成
	url, err := g.client.Bucket(g.bucketName).SignedURL(objectName, opts)
	if err != nil {
		return "", fmt.Errorf("failed to create signed URL: %w", err)
	}

	return url, nil
}

// CreateDownloadSignedURL ファイルダウンロード用のSignedURLを作成
func (g *GCSClient) CreateDownloadSignedURL(ctx context.Context, objectName string, expiration time.Duration) (string, error) {
	// Pre-signed URLの設定（ダウンロード用）
	opts := &storage.SignedURLOptions{
		Scheme:  storage.SigningSchemeV4,
		Method:  "GET",
		Expires: time.Now().Add(expiration),
	}

	// Signed URLを生成
	url, err := g.client.Bucket(g.bucketName).SignedURL(objectName, opts)
	if err != nil {
		return "", fmt.Errorf("failed to create download signed URL: %w", err)
	}

	return url, nil
}

// UploadFile ファイルをGoogle Cloud Storageにアップロード
func (g *GCSClient) UploadFile(ctx context.Context, objectName string, data []byte, contentType string) error {
	wc := g.client.Bucket(g.bucketName).Object(objectName).NewWriter(ctx)
	wc.ContentType = contentType

	defer wc.Close()

	if _, err := wc.Write(data); err != nil {
		return fmt.Errorf("failed to write data: %w", err)
	}

	return nil
}

// DeleteFile Google Cloud Storageからファイルを削除
func (g *GCSClient) DeleteFile(ctx context.Context, objectName string) error {
	obj := g.client.Bucket(g.bucketName).Object(objectName)
	if err := obj.Delete(ctx); err != nil {
		return fmt.Errorf("failed to delete object: %w", err)
	}

	return nil
}

// FileExists ファイルが存在するかチェック
func (g *GCSClient) FileExists(ctx context.Context, objectName string) (bool, error) {
	_, err := g.client.Bucket(g.bucketName).Object(objectName).Attrs(ctx)
	if err != nil {
		if err == storage.ErrObjectNotExist {
			return false, nil
		}
		return false, fmt.Errorf("failed to get object attributes: %w", err)
	}
	return true, nil
}

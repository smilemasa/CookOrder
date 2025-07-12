package admin

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"cloud.google.com/go/storage"
	"github.com/google/uuid"
	"github.com/smilemasa/go-api/db"
	"github.com/smilemasa/go-api/model"
)

// 料理投稿ハンドラー
// @Summary 新しい料理を登録
// @Description 新しい料理を登録します（写真ファイルと料理情報を同時に送信）
// @Tags dishes
// @Accept multipart/form-data
// @Produce json
// @Param photo formData file true "料理の写真ファイル"
// @Param nameJa formData string true "料理名（日本語）"
// @Param nameEn formData string true "料理名（英語）"
// @Param price formData integer true "料理の価格"
// @Success 201 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /dishes [post]
func PostDish(w http.ResponseWriter, r *http.Request) {
	// Parse multipart form to handle file upload
	r.ParseMultipartForm(10 << 20) // Limit upload size to 10MB
	file, header, err := r.FormFile("photo")
	if err != nil {
		http.Error(w, "Failed to get photo from request", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Validate file type
	allowedExts := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".webp": true,
	}
	
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedExts[ext] {
		http.Error(w, "Invalid file type. Only jpg, jpeg, png, webp are allowed", http.StatusBadRequest)
		return
	}

	// Generate secure file name with timestamp and UUID
	timestamp := time.Now().Unix()
	uniqueFileName := fmt.Sprintf("dish_%d_%s%s", timestamp, uuid.New().String(), ext)

	// Get GCS bucket name from environment variables
	bucketName := os.Getenv("GCS_BUCKET_NAME")
	if bucketName == "" {
		http.Error(w, "GCS_BUCKET_NAME is not set in environment variables", http.StatusInternalServerError)
		return
	}

	// Upload file to GCS
	ctx := context.Background()
	client, err := storage.NewClient(ctx)
	if err != nil {
		http.Error(w, "Failed to create GCS client", http.StatusInternalServerError)
		return
	}
	defer client.Close()

	bucket := client.Bucket(bucketName)
	object := bucket.Object(uniqueFileName)
	writer := object.NewWriter(ctx)
	if _, err := io.Copy(writer, file); err != nil {
		http.Error(w, "Failed to upload photo to GCS", http.StatusInternalServerError)
		return
	}
	if err := writer.Close(); err != nil {
		http.Error(w, "Failed to finalize photo upload to GCS", http.StatusInternalServerError)
		return
	}

	// Set the photo URL in the Dish struct
	photoURL := fmt.Sprintf("https://storage.googleapis.com/%s/%s", bucketName, uniqueFileName)

	// Get form data for dish information
	nameJa := r.FormValue("nameJa")
	nameEn := r.FormValue("nameEn")
	priceStr := r.FormValue("price")
	
	// Convert price to integer
	price := 0
	if priceStr != "" {
		if p, err := strconv.Atoi(priceStr); err == nil {
			price = p
		}
	}

	// Create dish struct
	d := model.Dish{
		NameJa: nameJa,
		NameEn: nameEn,
		Price:  price,
		Img:    photoURL,
	}

	fmt.Printf("デコード直後: %+v\n", d)

	if d.NameJa == "" || d.NameEn == "" || d.Price <= 0 || d.Img == "" {
		fmt.Printf("バリデーションNG: %+v\n", d)
		http.Error(w, "不正な入力値", http.StatusBadRequest)
		return
	}

	conn, err := db.ConnectDB()
	if err != nil {
		http.Error(w, "DB接続失敗: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer conn.Close(context.Background())
	fmt.Printf("受け取った値: %+v\n", d)

	// idは自動割り当てのため指定しない
	row := conn.QueryRow(context.Background(),
		`INSERT INTO dishes (name_ja, name_en, price, photo_url) VALUES ($1, $2, $3, $4) RETURNING id`,
		d.NameJa, d.NameEn, d.Price, d.Img,
	)

	var id string
	if err := row.Scan(&id); err != nil {
		http.Error(w, "ID取得失敗: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"status": "created", "id": id})
}

package admin

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"strconv"

	"github.com/smilemasa/go-api/db"
	"github.com/smilemasa/go-api/model"
	"github.com/smilemasa/go-api/utils"
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

	// Get form data for dish information first for early validation
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

	// バリデーション用のリクエスト構造体を作成
	dishRequest := CreateDishRequest{
		NameJa: nameJa,
		NameEn: nameEn,
		Price:  price,
	}

	// バリデーション実行（ファイルアップロード前に実行）
	if validationErrors := validateCreateDishRequest(dishRequest); len(validationErrors) > 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Errors: validationErrors})
		return
	}

	// ファイル取得とバリデーション
	file, header, err := r.FormFile("photo")
	if err != nil {
		writeErrorResponse(w, http.StatusBadRequest, "写真", "写真ファイルが選択されていません")
		return
	}
	defer file.Close()

	// ファイル形式のバリデーション
	if !isValidImageFormat(header.Filename) {
		writeErrorResponse(w, http.StatusBadRequest, "写真", "対応していないファイル形式です。jpg、jpeg、png、webpのみ対応しています")
		return
	}

	// Generate secure file name with timestamp and UUID
	uniqueFileName := generateSecureFileName(header.Filename)

	// Upload file to GCS
	ctx := context.Background()
	gcsClient, err := utils.GetGCSClient()
	if err != nil {
		writeErrorResponse(w, http.StatusInternalServerError, "ストレージ", "ストレージクライアントの取得に失敗しました")
		return
	}

	// ファイルの内容を読み取り
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		writeErrorResponse(w, http.StatusInternalServerError, "写真", "ファイルの読み取りに失敗しました")
		return
	}

	// Content-Typeを設定
	ext := getFileExtension(header.Filename)
	contentType := "image/jpeg"
	switch ext {
	case ".png":
		contentType = "image/png"
	case ".webp":
		contentType = "image/webp"
	}

	// GCSにファイルをアップロード
	if err := gcsClient.UploadFile(ctx, uniqueFileName, fileBytes, contentType); err != nil {
		writeErrorResponse(w, http.StatusInternalServerError, "写真", "写真のアップロードに失敗しました")
		return
	}

	// Set the photo URL in the Dish struct
	// データベースにはファイル名のみを保存（署名付きURLは取得時に生成）
	photoURL := uniqueFileName

	// Create dish struct
	d := model.Dish{
		NameJa: nameJa,
		NameEn: nameEn,
		Price:  price,
		Img:    photoURL,
	}

	conn, err := db.ConnectDB()
	if err != nil {
		writeErrorResponse(w, http.StatusInternalServerError, "データベース", "データベース接続に失敗しました")
		return
	}
	defer conn.Close(context.Background())

	row := conn.QueryRow(context.Background(),
		`INSERT INTO dishes (name_ja, name_en, price, photo_url) VALUES ($1, $2, $3, $4) RETURNING id`,
		d.NameJa, d.NameEn, d.Price, d.Img,
	)

	var id string
	if err := row.Scan(&id); err != nil {
		writeErrorResponse(w, http.StatusInternalServerError, "データベース", "料理の登録に失敗しました")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"status": "created", "id": id})
}

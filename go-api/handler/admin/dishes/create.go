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

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
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
	if validationErrors := validateDishRequest(dishRequest); len(validationErrors) > 0 {
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
	timestamp := time.Now().Unix()
	ext := getFileExtension(header.Filename)
	uniqueFileName := fmt.Sprintf("dish_%d_%s%s", timestamp, uuid.New().String(), ext)

	// Get GCS bucket name from environment variables
	bucketName := os.Getenv("GCS_BUCKET_NAME")
	if bucketName == "" {
		writeErrorResponse(w, http.StatusInternalServerError, "設定", "ストレージの設定が正しくありません")
		return
	}

	// Upload file to GCS
	ctx := context.Background()
	gcsClient, err := utils.NewGCSClient(ctx, bucketName)
	if err != nil {
		writeErrorResponse(w, http.StatusInternalServerError, "ストレージ", "ストレージクライアントの作成に失敗しました")
		return
	}
	defer gcsClient.Close()

	// ファイルの内容を読み取り
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		writeErrorResponse(w, http.StatusInternalServerError, "写真", "ファイルの読み取りに失敗しました")
		return
	}

	// Content-Typeを設定
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

// CreateDishRequest バリデーション用のリクエスト構造体
type CreateDishRequest struct {
	NameJa string `validate:"required,min=1,max=100" json:"nameJa"`
	NameEn string `validate:"required,min=1,max=100" json:"nameEn"`
	Price  int    `validate:"required,min=1" json:"price"`
}

// ValidationError バリデーションエラーの詳細
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// ErrorResponse エラーレスポンス
type ErrorResponse struct {
	Errors []ValidationError `json:"errors"`
}

// バリデーターインスタンス
var validate *validator.Validate

func init() {
	validate = validator.New()
}

// validateDishRequest リクエストデータのバリデーション
func validateDishRequest(req CreateDishRequest) []ValidationError {
	var errors []ValidationError

	err := validate.Struct(req)
	if err != nil {
		for _, err := range err.(validator.ValidationErrors) {
			var message string
			switch err.Tag() {
			case "required":
				message = "この項目は必須です"
			case "min":
				if err.Field() == "Price" {
					message = "価格は1円以上である必要があります"
				} else {
					message = fmt.Sprintf("最低%s文字以上入力してください", err.Param())
				}
			case "max":
				message = fmt.Sprintf("最大%s文字以下で入力してください", err.Param())
			default:
				message = "不正な値です"
			}

			var fieldName string
			switch err.Field() {
			case "NameJa":
				fieldName = "料理名（日本語）"
			case "NameEn":
				fieldName = "料理名（英語）"
			case "Price":
				fieldName = "価格"
			default:
				fieldName = err.Field()
			}

			errors = append(errors, ValidationError{
				Field:   fieldName,
				Message: message,
			})
		}
	}

	// 追加の独自バリデーション
	if strings.TrimSpace(req.NameJa) == "" {
		errors = append(errors, ValidationError{
			Field:   "料理名（日本語）",
			Message: "空白のみの入力は無効です",
		})
	}
	if strings.TrimSpace(req.NameEn) == "" {
		errors = append(errors, ValidationError{
			Field:   "料理名（英語）",
			Message: "空白のみの入力は無効です",
		})
	}

	return errors
}

// ヘルパー関数: エラーレスポンスの共通処理
func writeErrorResponse(w http.ResponseWriter, statusCode int, field, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(ErrorResponse{
		Errors: []ValidationError{
			{Field: field, Message: message},
		},
	})
}

// ヘルパー関数: 画像ファイル形式のバリデーション
func isValidImageFormat(filename string) bool {
	allowedExts := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".webp": true,
	}
	ext := strings.ToLower(filepath.Ext(filename))
	return allowedExts[ext]
}

// ヘルパー関数: ファイル拡張子の取得
func getFileExtension(filename string) string {
	return strings.ToLower(filepath.Ext(filename))
}

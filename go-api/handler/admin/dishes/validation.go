package admin

import (
	"encoding/json"
	"fmt"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

// CreateDishRequest バリデーション用のリクエスト構造体
type CreateDishRequest struct {
	NameJa string `validate:"required,min=1,max=100" json:"nameJa"`
	NameEn string `validate:"required,min=1,max=100" json:"nameEn"`
	Price  int    `validate:"required,min=1" json:"price"`
}

// UpdateDishRequest 更新用のリクエスト構造体
type UpdateDishRequest struct {
	NameJa string `validate:"omitempty,min=1,max=100" json:"nameJa"`
	NameEn string `validate:"omitempty,min=1,max=100" json:"nameEn"`
	Price  int    `validate:"omitempty,min=1" json:"price"`
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

// validateCreateDishRequest 作成時のリクエストデータのバリデーション
func validateCreateDishRequest(req CreateDishRequest) []ValidationError {
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

			fieldName := getFieldName(err.Field())
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

// validateUpdateDishRequest 更新時のリクエストデータのバリデーション
func validateUpdateDishRequest(req UpdateDishRequest) []ValidationError {
	var errors []ValidationError

	err := validate.Struct(req)
	if err != nil {
		for _, err := range err.(validator.ValidationErrors) {
			var message string
			switch err.Tag() {
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

			fieldName := getFieldName(err.Field())
			errors = append(errors, ValidationError{
				Field:   fieldName,
				Message: message,
			})
		}
	}

	// 追加の独自バリデーション（空でない場合のみ）
	if req.NameJa != "" && strings.TrimSpace(req.NameJa) == "" {
		errors = append(errors, ValidationError{
			Field:   "料理名（日本語）",
			Message: "空白のみの入力は無効です",
		})
	}
	if req.NameEn != "" && strings.TrimSpace(req.NameEn) == "" {
		errors = append(errors, ValidationError{
			Field:   "料理名（英語）",
			Message: "空白のみの入力は無効です",
		})
	}

	return errors
}

// getFieldName フィールド名を日本語に変換
func getFieldName(field string) string {
	switch field {
	case "NameJa":
		return "料理名（日本語）"
	case "NameEn":
		return "料理名（英語）"
	case "Price":
		return "価格"
	default:
		return field
	}
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

// ヘルパー関数: セキュアなファイル名の生成
func generateSecureFileName(originalFilename string) string {
	ext := getFileExtension(originalFilename)
	return fmt.Sprintf("dish_%d_%s%s",
		time.Now().Unix(),
		uuid.New().String(),
		ext)
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

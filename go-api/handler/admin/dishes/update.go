package admin

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/smilemasa/go-api/db"
	"github.com/smilemasa/go-api/model"
	"github.com/smilemasa/go-api/utils"
)

// 料理更新ハンドラー
// @Summary 料理更新
// @Description ID指定で料理を更新します（写真ファイルと料理情報を個別に更新可能）
// @Tags dishes
// @Accept multipart/form-data
// @Produce json
// @Param id path string true "料理ID"
// @Param photo formData file false "料理の写真ファイル（変更する場合のみ）"
// @Param nameJa formData string false "料理名（日本語）"
// @Param nameEn formData string false "料理名（英語）"
// @Param price formData int false "料理の価格"
// @Success 200 {object} model.Dish
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /dishes/{id} [put]
func PutDish(w http.ResponseWriter, r *http.Request) {
	// URLパラメータからIDを取得
	vars := mux.Vars(r)
	id := vars["id"]
	if id == "" {
		writeErrorResponse(w, http.StatusBadRequest, "ID", "IDが指定されていません")
		return
	}

	// フォームデータから更新用の値を取得（オプショナル）
	nameJa := r.FormValue("nameJa")
	nameEn := r.FormValue("nameEn")
	priceStr := r.FormValue("price")

	// バリデーション用のリクエスト構造体を作成
	var price int
	if priceStr != "" {
		var err error
		price, err = strconv.Atoi(priceStr)
		if err != nil {
			writeErrorResponse(w, http.StatusBadRequest, "価格", "価格が不正です")
			return
		}
	}

	updateRequest := UpdateDishRequest{
		NameJa: nameJa,
		NameEn: nameEn,
		Price:  price,
	}

	// バリデーション実行
	if validationErrors := validateUpdateDishRequest(updateRequest); len(validationErrors) > 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Errors: validationErrors})
		return
	}

	// マルチパートフォームの解析
	err := r.ParseMultipartForm(10 << 20) // 10MB
	if err != nil {
		writeErrorResponse(w, http.StatusBadRequest, "フォーム", "フォームデータの解析に失敗しました")
		return
	}

	conn, err := db.ConnectDB()
	if err != nil {
		writeErrorResponse(w, http.StatusInternalServerError, "データベース", "データベース接続に失敗しました")
		return
	}
	defer conn.Close(context.Background())

	// 現在の料理情報を取得
	var currentDish model.Dish
	row := conn.QueryRow(context.Background(),
		`SELECT id, name_ja, name_en, price, photo_url FROM dishes WHERE id = $1`,
		id,
	)
	if err := row.Scan(&currentDish.ID, &currentDish.NameJa, &currentDish.NameEn, &currentDish.Price, &currentDish.Img); err != nil {
		writeErrorResponse(w, http.StatusNotFound, "料理", "指定されたIDの料理が見つかりません")
		return
	}

	// 現在の値で初期化
	updateDish := currentDish

	// 提供された値で上書き
	if nameJa != "" {
		updateDish.NameJa = nameJa
	}
	if nameEn != "" {
		updateDish.NameEn = nameEn
	}
	if priceStr != "" {
		updateDish.Price = price // 既にバリデーション済み
	}

	// GCSクライアントを取得
	gcsClient, err := utils.GetGCSClient()
	if err != nil {
		writeErrorResponse(w, http.StatusInternalServerError, "ストレージ", "ストレージクライアントの取得に失敗しました")
		return
	}

	// 写真ファイルの処理（オプショナル）
	file, handler, err := r.FormFile("photo")
	if err == nil {
		defer file.Close()

		// ファイル拡張子のチェック
		if !isValidImageFormat(handler.Filename) {
			writeErrorResponse(w, http.StatusBadRequest, "写真", "対応していないファイル形式です。jpg、jpeg、png、webpのみ対応しています")
			return
		}

		// ファイル名の生成
		fileName := generateSecureFileName(handler.Filename)

		// ファイル内容を読み取り
		fileBytes, err := io.ReadAll(file)
		if err != nil {
			writeErrorResponse(w, http.StatusInternalServerError, "写真", "ファイルの読み取りに失敗しました")
			return
		}

		// Content-Typeの設定
		ext := getFileExtension(handler.Filename)
		contentType := "image/jpeg"
		switch ext {
		case ".png":
			contentType = "image/png"
		case ".webp":
			contentType = "image/webp"
		}

		// GCSにアップロード
		err = gcsClient.UploadFile(context.Background(), fileName, fileBytes, contentType)
		if err != nil {
			writeErrorResponse(w, http.StatusInternalServerError, "写真", "写真のアップロードに失敗しました")
			return
		}

		// 画像URLを更新
		updateDish.Img = fileName
	}

	// 料理情報を更新
	result, err := conn.Exec(context.Background(),
		`UPDATE dishes SET name_ja = $1, name_en = $2, price = $3, photo_url = $4 WHERE id = $5`,
		updateDish.NameJa, updateDish.NameEn, updateDish.Price, updateDish.Img, id,
	)
	if err != nil {
		writeErrorResponse(w, http.StatusInternalServerError, "データベース", "更新に失敗しました")
		return
	}

	if result.RowsAffected() == 0 {
		writeErrorResponse(w, http.StatusNotFound, "料理", "指定されたIDの料理が見つかりません")
		return
	}

	// 更新された料理情報を取得して返す
	var updatedDish model.Dish
	row = conn.QueryRow(context.Background(),
		`SELECT id, name_ja, name_en, price, photo_url FROM dishes WHERE id = $1`,
		id,
	)

	if err := row.Scan(&updatedDish.ID, &updatedDish.NameJa, &updatedDish.NameEn, &updatedDish.Price, &updatedDish.Img); err != nil {
		writeErrorResponse(w, http.StatusInternalServerError, "データベース", "更新データの取得に失敗しました")
		return
	}

	// 画像URLを署名付きURLに変換
	if updatedDish.Img != "" {
		var objectName string
		if strings.HasPrefix(updatedDish.Img, "https://storage.googleapis.com/") {
			// 完全URLからオブジェクト名を抽出
			urlParts := strings.Split(updatedDish.Img, "/")
			if len(urlParts) >= 2 {
				objectName = urlParts[len(urlParts)-1] // ファイル名を取得
			}
		} else {
			// ファイル名のみの場合はそのまま使用
			objectName = updatedDish.Img
		}

		if objectName != "" {
			// 1時間の有効期限で署名付きURLを生成
			fmt.Println("ConvertToSignedURL objectName:", objectName)
			signedURL, err := gcsClient.CreateDownloadSignedURL(context.Background(), objectName, 1*time.Hour)
			if err != nil {
				writeErrorResponse(w, http.StatusInternalServerError, "画像", "署名付きURL生成に失敗しました")
				return
			}
			updatedDish.Img = signedURL
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedDish)
}

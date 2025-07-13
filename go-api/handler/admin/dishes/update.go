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
		http.Error(w, "IDが指定されていません", http.StatusBadRequest)
		return
	}

	// マルチパートフォームの解析
	err := r.ParseMultipartForm(10 << 20) // 10MB
	if err != nil {
		http.Error(w, "フォームデータの解析失敗: "+err.Error(), http.StatusBadRequest)
		return
	}

	conn, err := db.ConnectDB()
	if err != nil {
		http.Error(w, "DB接続失敗: "+err.Error(), http.StatusInternalServerError)
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
		http.Error(w, "指定されたIDの料理が見つかりません", http.StatusNotFound)
		return
	}

	// フォームデータから更新用の値を取得（オプショナル）
	nameJa := r.FormValue("nameJa")
	nameEn := r.FormValue("nameEn")
	priceStr := r.FormValue("price")

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
		price, err := strconv.Atoi(priceStr)
		if err != nil || price <= 0 {
			http.Error(w, "価格が不正です", http.StatusBadRequest)
			return
		}
		updateDish.Price = price
	}

	// GCSクライアントを作成
	bucketName := os.Getenv("GCS_BUCKET_NAME")
	if bucketName == "" {
		http.Error(w, "GCS_BUCKET_NAME環境変数が設定されていません", http.StatusInternalServerError)
		return
	}

	gcsClient, err := utils.NewGCSClient(context.Background(), bucketName)
	if err != nil {
		http.Error(w, "GCSクライアント作成失敗: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer gcsClient.Close()

	// 写真ファイルの処理（オプショナル）
	file, handler, err := r.FormFile("photo")
	if err == nil {
		defer file.Close()

		// ファイル拡張子のチェック
		ext := strings.ToLower(filepath.Ext(handler.Filename))
		if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
			http.Error(w, "サポートされていないファイル形式です", http.StatusBadRequest)
			return
		}

		// ファイル名の生成（タイムスタンプ + 元のファイル名）
		fileName := fmt.Sprintf("%d_%s", time.Now().Unix(), handler.Filename)

		// ファイル内容を読み取り
		fileBytes, err := io.ReadAll(file)
		if err != nil {
			http.Error(w, "ファイル読み取り失敗: "+err.Error(), http.StatusBadRequest)
			return
		}

		// GCSにアップロード
		err = gcsClient.UploadFile(context.Background(), fileName, fileBytes, handler.Header.Get("Content-Type"))
		if err != nil {
			http.Error(w, "画像アップロード失敗: "+err.Error(), http.StatusInternalServerError)
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
		http.Error(w, "更新失敗: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if result.RowsAffected() == 0 {
		http.Error(w, "指定されたIDの料理が見つかりません", http.StatusNotFound)
		return
	}

	// 更新された料理情報を取得して返す
	var updatedDish model.Dish
	row = conn.QueryRow(context.Background(),
		`SELECT id, name_ja, name_en, price, photo_url FROM dishes WHERE id = $1`,
		id,
	)

	if err := row.Scan(&updatedDish.ID, &updatedDish.NameJa, &updatedDish.NameEn, &updatedDish.Price, &updatedDish.Img); err != nil {
		http.Error(w, "更新データ取得失敗: "+err.Error(), http.StatusInternalServerError)
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
				http.Error(w, "署名付きURL生成失敗: "+err.Error(), http.StatusInternalServerError)
				return
			}
			updatedDish.Img = signedURL
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedDish)
}

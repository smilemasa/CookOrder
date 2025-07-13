package admin

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/smilemasa/go-api/db"
	"github.com/smilemasa/go-api/model"
	"github.com/smilemasa/go-api/utils"
)

// 管理者用の料理取得ハンドラー
// @Summary 料理一覧取得
// @Description 料理一覧を取得します
// @Tags dishes
// @Produce json
// @Success 200 {array} model.Dish
// @Router /dishes [get]
func AdminGetDishes(w http.ResponseWriter, r *http.Request) {
	conn, err := db.ConnectDB()
	if err != nil {
		http.Error(w, "DB接続失敗: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer conn.Close(context.Background())

	// GCSクライアントを取得
	gcsClient, err := utils.GetGCSClient()
	if err != nil {
		http.Error(w, "GCSクライアント取得失敗: "+err.Error(), http.StatusInternalServerError)
		return
	}

	rows, err := conn.Query(context.Background(), "SELECT id, name_ja, name_en, price, photo_url FROM dishes")
	if err != nil {
		http.Error(w, "データ取得失敗: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	dishes := []model.Dish{}
	for rows.Next() {
		var d model.Dish
		if err := rows.Scan(&d.ID, &d.NameJa, &d.NameEn, &d.Price, &d.Img); err != nil {
			http.Error(w, "データスキャン失敗: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// 画像URLを署名付きURLに変換
		originalImg := d.Img
		if d.Img != "" {
			// 1時間の有効期限で署名付きURLを生成
			fmt.Println("ConvertToSignedURL objectName:", d.Img)
			signedURL, err := gcsClient.CreateDownloadSignedURL(context.Background(), d.Img, 1*time.Hour)
			if err != nil {
				http.Error(w, "署名付きURL生成失敗: "+err.Error(), http.StatusInternalServerError)
				return
			}
			d.Img = signedURL
		}

		// デバッグ用（本番環境では削除）
		if originalImg != d.Img {
			fmt.Printf("画像URL変換: %s -> %s\n", originalImg, d.Img)
		}

		dishes = append(dishes, d)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(dishes)
}

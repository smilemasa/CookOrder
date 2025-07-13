package admin

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/mux"
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

		if d.Img != "" {
			// 1時間の有効期限で署名付きURLを生成
			signedURL, err := gcsClient.CreateDownloadSignedURL(context.Background(), d.Img, 1*time.Hour)
			if err != nil {
				http.Error(w, "署名付きURL生成失敗: "+err.Error(), http.StatusInternalServerError)
				return
			}
			d.Img = signedURL
		}

		dishes = append(dishes, d)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(dishes)
}

// 管理者用の個別料理取得ハンドラー
// @Summary 料理詳細取得
// @Description ID指定で料理の詳細を取得します
// @Tags dishes
// @Param id path string true "料理ID"
// @Produce json
// @Success 200 {object} model.Dish
// @Failure 400 {object} model.ErrorResponse
// @Failure 404 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /dishes/{id} [get]
func AdminGetDish(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	dishID := vars["id"]

	if dishID == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "料理IDが指定されていません"})
		return
	}

	conn, err := db.ConnectDB()
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "DB接続失敗: " + err.Error()})
		return
	}
	defer conn.Close(context.Background())

	// GCSクライアントを取得
	gcsClient, err := utils.GetGCSClient()
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "GCSクライアント取得失敗: " + err.Error()})
		return
	}

	var dish model.Dish
	err = conn.QueryRow(context.Background(), "SELECT id, name_ja, name_en, price, photo_url FROM dishes WHERE id = $1", dishID).
		Scan(&dish.ID, &dish.NameJa, &dish.NameEn, &dish.Price, &dish.Img)

	if err != nil {
		if err.Error() == "no rows in result set" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]string{"error": "指定されたIDの料理が見つかりません"})
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "データ取得失敗: " + err.Error()})
		return
	}

	if dish.Img != "" {
		// 1時間の有効期限で署名付きURLを生成
		signedURL, err := gcsClient.CreateDownloadSignedURL(context.Background(), dish.Img, 1*time.Hour)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "署名付きURL生成失敗: " + err.Error()})
			return
		}
		dish.Img = signedURL
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(dish)
}

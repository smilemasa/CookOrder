package admin

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/smilemasa/go-api/db"
	"github.com/smilemasa/go-api/model"
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
		dishes = append(dishes, d)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(dishes)
}

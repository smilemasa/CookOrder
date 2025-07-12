package admin

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/smilemasa/go-api/db"
	"github.com/smilemasa/go-api/model"
)

// 料理検索ハンドラー
// @Summary 料理検索
// @Description 日本語名・英語名で料理を部分一致検索します
// @Tags dishes
// @Produce json
// @Param nameJa query string false "日本語名で部分一致検索"
// @Param nameEn query string false "英語名で部分一致検索"
// @Success 200 {array} model.Dish
// @Failure 400 {object} map[string]string
// @Router /dishes/search [get]
func SearchDishes(w http.ResponseWriter, r *http.Request) {
	name := r.URL.Query().Get("name")
	if name == "" {
		http.Error(w, "name parameter is required", http.StatusBadRequest)
		return
	}

	conn, err := db.ConnectDB()
	if err != nil {
		http.Error(w, "DB接続失敗: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer conn.Close(context.Background())

	rows, err := conn.Query(
		context.Background(),
		"SELECT id, name_ja, name_en, price, photo_url FROM dishes WHERE name_ja ILIKE $1 OR name_en ILIKE $1",
		"%"+strings.ReplaceAll(name, " ", "%")+"%",
	)
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

package admin

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/smilemasa/go-api/db"
	"github.com/smilemasa/go-api/model"
)

// 料理更新ハンドラー
// @Summary 料理更新
// @Description ID指定で料理を更新します
// @Tags dishes
// @Accept json
// @Produce json
// @Param id query string true "料理ID"
// @Param dish body model.Dish true "Dish情報"
// @Success 200 {object} model.Dish
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /dishes/{id} [put]
func PutDish(w http.ResponseWriter, r *http.Request) {
	// IDパラメータの取得
	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "IDが指定されていません", http.StatusBadRequest)
		return
	}

	// リクエストボディの解析
	var d model.Dish
	if err := json.NewDecoder(r.Body).Decode(&d); err != nil {
		http.Error(w, "JSONパース失敗", http.StatusBadRequest)
		return
	}

	// バリデーション
	if d.NameJa == "" || d.NameEn == "" || d.Price <= 0 || d.Img == "" {
		http.Error(w, "不正な入力値", http.StatusBadRequest)
		return
	}

	conn, err := db.ConnectDB()
	if err != nil {
		http.Error(w, "DB接続失敗: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer conn.Close(context.Background())

	// 料理の存在確認と更新
	result, err := conn.Exec(context.Background(),
		`UPDATE dishes SET name_ja = $1, name_en = $2, price = $3, photo_url = $4 WHERE id = $5`,
		d.NameJa, d.NameEn, d.Price, d.Img, id,
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
	row := conn.QueryRow(context.Background(),
		`SELECT id, name_ja, name_en, price, photo_url FROM dishes WHERE id = $1`,
		id,
	)

	if err := row.Scan(&updatedDish.ID, &updatedDish.NameJa, &updatedDish.NameEn, &updatedDish.Price, &updatedDish.Img); err != nil {
		http.Error(w, "更新データ取得失敗: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedDish)
}

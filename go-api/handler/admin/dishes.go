package admin

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/smilemasa/go-api/db"
	"github.com/smilemasa/go-api/model"
)

// 料理投稿ハンドラー
// @Summary 新しい料理を登録
// @Description 新しい料理を登録します
// @Tags dishes
// @Accept json
// @Produce json
// @Param dish body model.Dish true "Dish情報"
// @Success 201 {object} model.Dish
// @Failure 400 {object} map[string]string
// @Router /dishes [post]
func PostDish(w http.ResponseWriter, r *http.Request) {
	var d model.Dish
	if err := json.NewDecoder(r.Body).Decode(&d); err != nil {
		http.Error(w, "JSONパース失敗", http.StatusBadRequest)
		return
	}
	fmt.Printf("デコード直後: %+v\n", d)

	if d.NameJa == "" || d.NameEn == "" || d.Price <= 0 || d.Img == "" {
		fmt.Printf("バリデーションNG: %+v\n", d)
		http.Error(w, "不正な入力値", http.StatusBadRequest)
		return
	}

	conn, err := db.ConnectDB()
	if err != nil {
		http.Error(w, "DB接続失敗: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer conn.Close(context.Background())
	fmt.Printf("受け取った値: %+v\n", d)
	
	// idは自動割り当てのため指定しない
	row := conn.QueryRow(context.Background(),
		`INSERT INTO dishes (name_ja, name_en, price, photo_url) VALUES ($1, $2, $3, $4) RETURNING id`,
		d.NameJa, d.NameEn, d.Price, d.Img,
	)

	var id string
	if err := row.Scan(&id); err != nil {
		http.Error(w, "ID取得失敗: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"status": "created", "id": id})
}

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

// 料理削除ハンドラー
// @Summary 料理削除
// @Description ID指定で料理を削除します
// @Tags dishes
// @Param id query string true "料理ID"
// @Success 204 {string} string "No Content"
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /dishes/{id} [delete]
func DeleteDish(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "IDが指定されていません", http.StatusBadRequest)
		return
	}

	conn, err := db.ConnectDB()
	if err != nil {
		http.Error(w, "DB接続失敗: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer conn.Close(context.Background())

	result, err := conn.Exec(context.Background(), "DELETE FROM dishes WHERE id = $1", id)
	if err != nil {
		http.Error(w, "削除失敗: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if result.RowsAffected() == 0 {
		http.Error(w, "指定されたIDの料理が見つかりません", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

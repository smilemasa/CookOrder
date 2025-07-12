package admin

import (
	"context"
	"net/http"

	"github.com/smilemasa/go-api/db"
)

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

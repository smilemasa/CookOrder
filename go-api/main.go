package main

import (
	"fmt"
	"net/http"

	"github.com/smilemasa/go-api/handler/admin"
)

func main() {
	http.HandleFunc("/dishes", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			admin.PostDish(w, r)
		case http.MethodGet:
			admin.AdminGetDishes(w, r)
		default:
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}
	})

	http.HandleFunc("/dishes/search", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			admin.SearchDishes(w, r)
		default:
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}
	})

	fmt.Println("🚀 Listening on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}

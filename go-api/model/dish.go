package model

type Dish struct {
	ID     string `json:"id"`     // 料理ID
	NameJa string `json:"nameJa"` // 日本語名
	NameEn string `json:"nameEn"` // 英語名
	Price  int    `json:"price"`  // 価格
	Img    string `json:"img"`    // 画像URL
}

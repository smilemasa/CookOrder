package model

type Dish struct {
	ID     string `json:"id"`
	NameJa string `json:"nameJa"`
	NameEn string `json:"nameEn"`
	Price  int    `json:"price"`
	Img    string `json:"img"`
}

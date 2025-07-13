import apiClient from "./client";

// 型定義
export interface Dish {
  id: string | number;
  nameJa?: string;
  nameEn?: string;
  name?: string;
  price?: number;
  img?: string;
  image?: string;
}

export interface SearchParams {
  nameJa?: string;
  nameEn?: string;
}

// 料理関連のAPI関数
export const dishService = {
  // 全料理取得
  getAllDishes: async (): Promise<Dish[]> => {
    const response = await apiClient.get("/dishes")
    return response.data
  },

  // 料理詳細取得（ID指定）
  getDishById: async (id: string | number): Promise<Dish> => {
    const response = await apiClient.get(`/dishes/${id}`)
    return response.data
  },

  // 料理検索（日本語名・英語名）
  searchDishes: async ({ nameJa, nameEn }: SearchParams): Promise<Dish[]> => {
    const params = new URLSearchParams()
    if (nameJa) params.append("nameJa", nameJa)
    if (nameEn) params.append("nameEn", nameEn)

    const response = await apiClient.get(`/dishes/search?${params.toString()}`)
    return response.data
  },

  // 料理追加
  createDish: async (dishData: Partial<Dish>): Promise<Dish> => {
    const response = await apiClient.post("/dishes", dishData)
    return response.data
  },

  // 料理更新
  updateDish: async (id: string | number, dishData: Partial<Dish>): Promise<Dish> => {
    const response = await apiClient.put(`/dishes/${id}`, dishData)
    return response.data
  },

  // 料理削除
  deleteDish: async (id: string | number): Promise<void> => {
    const response = await apiClient.delete(`/dishes/${id}`)
    return response.data
  },
}

// 後方互換性のためのメニューエイリアス
export const menuService = {
  getAllMenus: dishService.getAllDishes,
  getMenuById: dishService.getDishById,
  searchMenus: (query: string) =>
    dishService.searchDishes({ nameJa: query, nameEn: query }),
  createMenu: dishService.createDish,
  updateMenu: dishService.updateDish,
  deleteMenu: dishService.deleteDish,
  getCategories: async () => {
    console.warn(
      "Categories endpoint not available in current API specification",
    )
    return []
  },
}

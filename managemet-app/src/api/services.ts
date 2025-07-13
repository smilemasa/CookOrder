import apiClient from "./client";

// OpenAPI仕様に基づく型定義
export interface Dish {
  id: string;
  nameJa: string;
  nameEn: string;
  price: number;
  img: string;
}

export interface DishRequest {
  nameJa: string;
  nameEn: string;
  price: number;
  img?: string; // 更新時は任意
}

export interface DishCreateRequest {
  nameJa: string;
  nameEn: string;
  price: number;
  photo: File; // multipart/form-data用
}

export interface DishUpdateRequest {
  nameJa?: string;
  nameEn?: string;
  price?: number;
  photo?: File; // multipart/form-data用（任意）
}

export interface SearchParams {
  name: string; // OpenAPI仕様では単一のnameパラメータ
}

export interface ApiError {
  error: string;
}

// 料理関連のAPI関数
export const dishService = {
  // 全料理取得
  getAllDishes: async (): Promise<Dish[]> => {
    const response = await apiClient.get("/dishes")
    return response.data
  },

  // 料理詳細取得（ID指定）
  getDishById: async (id: string): Promise<Dish> => {
    const response = await apiClient.get(`/dishes/${id}`)
    return response.data
  },

  // 料理検索（料理名で検索）
  searchDishes: async ({ name }: SearchParams): Promise<Dish[]> => {
    const params = new URLSearchParams()
    if (name) params.append("name", name)

    const response = await apiClient.get(`/dishes/search?${params.toString()}`)
    return response.data
  },

  // 料理追加（multipart/form-data）
  createDish: async (dishData: DishCreateRequest): Promise<{ status: string; id: string }> => {
    const formData = new FormData()
    formData.append("photo", dishData.photo)
    formData.append("nameJa", dishData.nameJa)
    formData.append("nameEn", dishData.nameEn)
    formData.append("price", dishData.price.toString())

    const response = await apiClient.post("/dishes", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  // 料理更新（multipart/form-data）
  updateDish: async (id: string, dishData: DishUpdateRequest): Promise<Dish> => {
    const formData = new FormData()

    if (dishData.photo) {
      formData.append("photo", dishData.photo)
    }
    if (dishData.nameJa !== undefined) {
      formData.append("nameJa", dishData.nameJa)
    }
    if (dishData.nameEn !== undefined) {
      formData.append("nameEn", dishData.nameEn)
    }
    if (dishData.price !== undefined) {
      formData.append("price", dishData.price.toString())
    }

    const response = await apiClient.put(`/dishes/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  // 料理削除
  deleteDish: async (id: string): Promise<void> => {
    await apiClient.delete(`/dishes/${id}`)
  },
}

// 後方互換性のためのメニューエイリアス
export const menuService = {
  getAllMenus: dishService.getAllDishes,
  getMenuById: dishService.getDishById,
  searchMenus: (query: string) =>
    dishService.searchDishes({ name: query }),
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

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// エラーハンドリング
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// 料理CRUD API（Swaggerに準拠）
export const dishAPI = {
  // 全料理取得
  getAllDishes: async () => {
    try {
      const response = await api.get('/dishes');
      return response.data;
    } catch (error) {
      console.error('Error fetching dishes:', error);
      throw error;
    }
  },

  // 料理詳細取得（ID指定）
  getDishById: async (id) => {
    try {
      const response = await api.get(`/dishes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dish:', error);
      throw error;
    }
  },

  // 料理検索（日本語名・英語名）
  searchDishes: async ({ nameJa, nameEn }) => {
    try {
      const params = new URLSearchParams();
      if (nameJa) params.append('nameJa', nameJa);
      if (nameEn) params.append('nameEn', nameEn);
      
      const response = await api.get(`/dishes/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error searching dishes:', error);
      throw error;
    }
  },

  // 料理追加
  createDish: async (dishData) => {
    try {
      const response = await api.post('/dishes', dishData);
      return response.data;
    } catch (error) {
      console.error('Error creating dish:', error);
      throw error;
    }
  },

  // 料理更新
  updateDish: async (id, dishData) => {
    try {
      const response = await api.put(`/dishes/${id}`, dishData);
      return response.data;
    } catch (error) {
      console.error('Error updating dish:', error);
      throw error;
    }
  },

  // 料理削除
  deleteDish: async (id) => {
    try {
      const response = await api.delete(`/dishes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting dish:', error);
      throw error;
    }
  }
};

// 後方互換性のためのエイリアス
export const menuAPI = {
  getAllMenus: dishAPI.getAllDishes,
  getMenuById: dishAPI.getDishById,
  searchMenus: (query) => dishAPI.searchDishes({ nameJa: query, nameEn: query }),
  createMenu: dishAPI.createDish,
  updateMenu: dishAPI.updateDish,
  deleteMenu: dishAPI.deleteDish,
  getCategories: async () => {
    console.warn('Categories endpoint not available in current API specification');
    return [];
  }
};

export default api;

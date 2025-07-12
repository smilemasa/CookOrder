// API関連のエクスポート

// クライアント
export { default as apiClient } from "./client"

// サービス関数
export { dishService, menuService } from "./services"

// React Queryフック
export {
  useGetAllDishes,
  useGetDishById,
  useSearchDishes,
  useCreateDish,
  useUpdateDish,
  useDeleteDish,
  // 後方互換性のためのメニュー用エイリアス
  useGetAllMenus,
  useGetMenuById,
  useCreateMenu,
  useUpdateMenu,
  useDeleteMenu,
  useSearchMenus,
  QUERY_KEYS,
} from "./hooks"

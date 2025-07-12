import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { dishService } from "./services"

// クエリキー
export const QUERY_KEYS = {
  DISHES: ["dishes"],
  DISH_BY_ID: (id) => ["dishes", id],
  SEARCH_DISHES: (params) => ["dishes", "search", params],
}

// 料理関連のカスタムフック

// 全料理取得
export const useGetAllDishes = (options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.DISHES,
    queryFn: dishService.getAllDishes,
    staleTime: 5 * 60 * 1000, // 5分間はキャッシュを有効とする
    ...options,
  })
}

// 料理詳細取得
export const useGetDishById = (id, options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.DISH_BY_ID(id),
    queryFn: () => dishService.getDishById(id),
    enabled: options.enabled !== undefined ? options.enabled : !!id, // IDが存在する場合のみクエリを実行
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

// 料理検索
export const useSearchDishes = (searchParams, options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.SEARCH_DISHES(searchParams),
    queryFn: () => dishService.searchDishes(searchParams),
    enabled: options.enabled !== undefined ? options.enabled : !!(searchParams.nameJa || searchParams.nameEn), // 検索パラメータがある場合のみ実行
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

// 料理作成
export const useCreateDish = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: dishService.createDish,
    onSuccess: () => {
      // 作成成功時に料理一覧を再取得
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DISHES })
    },
    onError: (error) => {
      console.error("Error creating dish:", error)
    },
  })
}

// 料理更新
export const useUpdateDish = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dishData }) => dishService.updateDish(id, dishData),
    onSuccess: (data, variables) => {
      // 更新成功時に該当料理のキャッシュを更新
      queryClient.setQueryData(QUERY_KEYS.DISH_BY_ID(variables.id), data)
      // 料理一覧も再取得
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DISHES })
    },
    onError: (error) => {
      console.error("Error updating dish:", error)
    },
  })
}

// 料理削除
export const useDeleteDish = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: dishService.deleteDish,
    onSuccess: (data, deletedId) => {
      // 削除成功時に該当料理のキャッシュを削除
      queryClient.removeQueries({ queryKey: QUERY_KEYS.DISH_BY_ID(deletedId) })
      // 料理一覧を再取得
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DISHES })
    },
    onError: (error) => {
      console.error("Error deleting dish:", error)
    },
  })
}

// 後方互換性のためのメニュー用フック
export const useGetAllMenus = useGetAllDishes
export const useGetMenuById = useGetDishById
export const useCreateMenu = useCreateDish
export const useUpdateMenu = useUpdateDish
export const useDeleteMenu = useDeleteDish

export const useSearchMenus = (query, options = {}) => {
  return useSearchDishes({ nameJa: query, nameEn: query }, options)
}

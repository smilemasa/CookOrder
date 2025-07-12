import React, { createContext, useContext, useState, useEffect } from "react"
import { dishAPI, menuAPI } from "../services/api"

const MenuContext = createContext()

export const useMenu = () => {
  const context = useContext(MenuContext)
  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider")
  }
  return context
}

export const MenuProvider = ({ children }) => {
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // サンプルデータ（API接続前のフォールバック）- Swaggerのmodel.Dishに準拠
  const sampleMenuData = [
    {
      id: "1",
      nameJa: "特製ラーメン",
      nameEn: "Special Ramen",
      price: 890,
      img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop",
    },
    {
      id: "2",
      nameJa: "醤油ラーメン",
      nameEn: "Soy Sauce Ramen",
      price: 750,
      // 画像なし - プレースホルダーが表示される
    },
    {
      id: "3",
      nameJa: "味噌ラーメン",
      nameEn: "Miso Ramen",
      price: 820,
      img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop",
    },
    {
      id: "4",
      nameJa: "チャーハン",
      nameEn: "Fried Rice",
      price: 680,
      // 画像なし - プレースホルダーが表示される
    },
    {
      id: "5",
      nameJa: "餃子（6個）",
      nameEn: "Gyoza (6 pieces)",
      price: 450,
      img: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&h=300&fit=crop",
    },
  ]

  // メニュー一覧取得
  const fetchMenus = async () => {
    setLoading(true)
    setError(null)
    try {
      // 新しいDish APIを使用
      const data = await dishAPI.getAllDishes()
      setMenus(data)
    } catch (err) {
      // API接続失敗時はサンプルデータを使用
      console.warn("API接続に失敗しました。サンプルデータを使用します。")
      setMenus(sampleMenuData)
      setError("APIに接続できませんでした。サンプルデータを表示しています。")
    } finally {
      setLoading(false)
    }
  }

  // メニュー検索（日本語名・英語名両方で検索）
  const searchMenus = async (query) => {
    if (!query.trim()) {
      await fetchMenus()
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Dish APIの検索機能を使用（日本語名・英語名両方で検索）
      const data = await dishAPI.searchDishes({
        nameJa: query,
        nameEn: query,
      })
      setMenus(data)
    } catch (err) {
      // フォールバック: ローカル検索
      const filtered = sampleMenuData.filter(
        (item) =>
          item.nameJa.toLowerCase().includes(query.toLowerCase()) ||
          item.nameEn.toLowerCase().includes(query.toLowerCase()),
      )
      setMenus(filtered)
      setError("API検索に失敗しました。ローカル検索結果を表示しています。")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenus()
  }, [])

  const value = {
    menus,
    loading,
    error,
    fetchMenus,
    searchMenus,
  }

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}

import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Infrastructure層では技術的なエラー変換のみ
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // AxiosエラーをDomainエラーに変換
    if (error.response) {
      // サーバーエラー (4xx, 5xx)
      const domainError = {
        type: 'API_ERROR',
        status: error.response.status,
        message: error.response.data?.message || error.message,
        data: error.response.data
      }
      return Promise.reject(domainError)
    }
    
    if (error.request) {
      // ネットワークエラー
      const domainError = {
        type: 'NETWORK_ERROR',
        message: 'ネットワークエラーが発生しました'
      }
      return Promise.reject(domainError)
    }
    
    // その他のエラー
    return Promise.reject({
      type: 'UNKNOWN_ERROR',
      message: error.message
    })
  },
)

export default apiClient

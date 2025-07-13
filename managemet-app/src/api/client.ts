import axios from "axios";

interface DomainError {
  type: 'API_ERROR' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR';
  status?: number;
  message: string;
  data?: any;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string

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
      const domainError: DomainError = {
        type: 'API_ERROR',
        status: error.response.status,
        message: error.response.data?.message || error.message,
        data: error.response.data
      }
      return Promise.reject(domainError)
    }

    if (error.request) {
      // ネットワークエラー
      const domainError: DomainError = {
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

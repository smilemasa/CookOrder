import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import "./index.css"

// QueryClientの設定
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // 失敗時のリトライ回数
      refetchOnWindowFocus: false, // ウィンドウフォーカス時の自動再取得を無効化
    },
  },
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)

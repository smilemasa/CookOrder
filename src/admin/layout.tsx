import React from "react";

// 管理者向けアプリ用のレイアウト
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: 32, background: '#f5f5f5' }}>{children}</div>;
}

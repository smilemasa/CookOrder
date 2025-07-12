# 料理メニュー管理アプリ

料理メニューの一覧表示と検索機能を提供するモダンなWebアプリケーションです。

## 🚀 技術スタック

- **フロントエンド**: React 18 + Vite
- **UIライブラリ**: Material-UI (MUI) v5
- **HTTPクライアント**: Axios
- **パッケージマネージャー**: pnpm

## 📦 セットアップ

### 前提条件

- Node.js 18.0.0 以上
- pnpm 8.0.0 以上

### インストール

```bash
npm install -g pnpm  # pnpmをグローバルインストール（未インストールの場合）
pnpm install         # 依存関係のインストール
```

### 開発サーバーの起動

```bash
pnpm dev  # 開発サーバーを起動
```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスしてください。

## 🎯 機能一覧

- 料理メニューの一覧表示（MUIカードデザイン）
- リアルタイム検索（日本語名・英語名対応）
- レスポンシブデザイン対応
- API連携とエラーハンドリング

## 📁 プロジェクト構成

```
src/
├── components/          # 再利用可能なコンポーネント
├── pages/               # ページコンポーネント
├── context/             # React Context（状態管理）
├── services/            # API通信ロジック
├── App.jsx              # メインアプリケーション
└── main.jsx             # エントリーポイント
```

## 🔗 API仕様

APIに関する詳細は、`go-api` ディレクトリを参照してください。

## 🔧 カスタマイズ

### MUIテーマの変更

`src/App.jsx` でテーマをカスタマイズできます：

```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});
```

### API設定の変更

`src/services/api.js` ファイルでAPIのベースURLやエンドポイントを変更できます：

```javascript
const API_BASE_URL = 'http://localhost:8080';
```

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

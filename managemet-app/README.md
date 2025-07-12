# 料理メニュー一覧アプリ

料理メニューの一覧表示と検索機能を提供するシンプルなWebアプリケーションです。

# 料理メニュー一覧アプリ

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
# pnpmをグローバルインストール（未インストールの場合）
npm install -g pnpm

# 依存関係のインストール
pnpm install
```

### 開発サーバーの起動

```bash
# 開発サーバーを起動
pnpm dev

# ブラウザで http://localhost:5173 にアクセス
```

### その他のコマンド

```bash
# プロダクションビルド
pnpm build

# ビルド結果のプレビュー
pnpm preview

# ESLintでコードチェック
pnpm lint
```

## 🎯 機能一覧

### 📱 メニュー表示機能
- 料理メニューの一覧表示（MUIカードデザイン）
- リアルタイム検索（日本語名・英語名対応）
- レスポンシブレイアウト

### 🎨 デザイン機能
- Material Design準拠のモダンなUI
- スムーズなアニメーション効果
- ホバーエフェクト
- グラデーション効果

### 🔧 API連携
- バックエンドAPIとの連携
- エラーハンドリング
- フォールバック機能（サンプルデータ表示）

## 📁 プロジェクト構成

```
src/
├── components/          # 再利用可能なコンポーネント
│   ├── MenuItem.jsx     # MUIカードベースのメニューアイテム
│   └── MenuList.jsx     # MUIグリッドレイアウト
├── pages/              # ページコンポーネント
│   └── MenuListPage.jsx # メインページ（MUIコンポーネント使用）
├── context/            # React Context（状態管理）
├── services/           # API通信ロジック
├── App.jsx             # MUIテーマプロバイダー設定
└── main.jsx           # エントリーポイント
```

## 🔗 API仕様

アプリケーションは以下のAPIエンドポイントを想定しています：

```
GET    /dishes                          # 全料理取得
GET    /dishes/search?nameJa=&nameEn=    # 料理検索
```

バックエンドAPIの実装に合わせて `src/services/api.js` を調整してください。

## 🌙 機能詳細

### Material-UI コンポーネント
- **Card**: 料理アイテムの表示
- **Container**: レイアウトコンテナ
- **Grid**: レスポンシブグリッドレイアウト
- **TextField**: 検索入力フィールド
- **Typography**: 統一されたテキストスタイル
- **Alert**: エラーメッセージ表示
- **CircularProgress**: ローディング表示
- **Chip**: 価格表示
- **Fade**: フェードインアニメーション

### デザイン特徴
- **レスポンシブデザイン**: PC・タブレット・スマートフォン対応
- **スムーズアニメーション**: ホバー効果とフェードイン
- **現代的なUI**: Material Design準拠
- **グラデーション**: 美しいビジュアル効果
- **インタラクティブ**: カードのクリック処理

### エラーハンドリング
- 画像読み込み失敗時のフォールバック表示
- API接続失敗時のサンプルデータ表示
- 美しいエラーメッセージ表示

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

## 📦 セットアップ

### 前提条件

- Node.js 18.0.0 以上
- pnpm 8.0.0 以上

### インストール

```bash
# pnpmをグローバルインストール（未インストールの場合）
npm install -g pnpm

# 依存関係のインストール
pnpm install
```

### 開発サーバーの起動

```bash
# 開発サーバーを起動
pnpm dev

# ブラウザで http://localhost:5173 にアクセス
```

### その他のコマンド

```bash
# プロダクションビルド
pnpm build

# ビルド結果のプレビュー
pnpm preview

# ESLintでコードチェック
pnpm lint
```

## 🎯 機能一覧

### 📱 メニュー表示機能
- 料理メニューの一覧表示
- リアルタイム検索（日本語名・英語名対応）

### 🔧 API連携
- バックエンドAPIとの連携
- エラーハンドリング
- フォールバック機能（サンプルデータ表示）

## 📁 プロジェクト構成

```
src/
├── components/          # 再利用可能なコンポーネント
├── pages/              # ページコンポーネント
├── context/            # React Context（状態管理）
├── services/           # API通信ロジック
├── App.jsx             # メインアプリケーション
└── main.jsx           # エントリーポイント
```

## 🔗 API仕様

アプリケーションは以下のAPIエンドポイントを想定しています：

```
GET    /dishes                          # 全料理取得
GET    /dishes/search?nameJa=&nameEn=    # 料理検索
```

バックエンドAPIの実装に合わせて `src/services/api.js` を調整してください。

## 🌙 機能詳細

- **レスポンシブデザイン**: PC・タブレット・スマートフォン対応
- **リアルタイム検索**: 日本語名・英語名での検索
- **画像表示**: 料理画像の表示（フォールバック対応）
- **ローディング表示**: API通信中の視覚的フィードバック
- **エラー表示**: エラー発生時の適切なメッセージ表示
- **サンプルデータ**: API未接続時のデモデータ表示

## 🔧 カスタマイズ

### API設定の変更

`src/services/api.js` ファイルでAPIのベースURLやエンドポイントを変更できます：

```javascript
const API_BASE_URL = 'http://localhost:8080';
```

### スタイリングの変更

CSSファイルを編集してデザインをカスタマイズできます：

- `src/index.css`: グローバルスタイル
- `src/components/*.css`: 各コンポーネントのスタイル

## 📋 開発のヒント

### pnpmの主な利点

- **高速**: npmやyarnより高速なインストール
- **効率的**: ディスク容量の節約
- **厳密**: より厳密な依存関係管理

### よく使うpnpmコマンド

```bash
# パッケージの追加
pnpm add <package-name>

# 開発依存関係として追加
pnpm add -D <package-name>

# パッケージの削除
pnpm remove <package-name>

# 依存関係の更新
pnpm update

# キャッシュのクリア
pnpm store prune
```

## 🤝 貢献

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

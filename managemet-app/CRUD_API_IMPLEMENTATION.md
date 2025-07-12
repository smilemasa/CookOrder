# 料理CRUD API実装

このプロジェクトでは、Swagger定義に基づいて料理の完全なCRUD操作を実装しました。

## API仕様（Swagger準拠）

### Dishモデル
```yaml
model.Dish:
  properties:
    id: string          # 料理ID
    nameJa: string      # 日本語名
    nameEn: string      # 英語名
    price: integer      # 価格
    img: string         # 画像URL
```

### エンドポイント

#### 1. 料理一覧取得
- **GET** `/dishes`
- 全料理の一覧を取得

#### 2. 料理詳細取得
- **GET** `/dishes/{id}`
- 指定したIDの料理詳細を取得

#### 3. 料理検索
- **GET** `/dishes/search?nameJa={日本語名}&nameEn={英語名}`
- 日本語名・英語名で部分一致検索

#### 4. 料理追加
- **POST** `/dishes`
- 新しい料理を登録

#### 5. 料理更新
- **PUT** `/dishes/{id}`
- 指定したIDの料理を更新

#### 6. 料理削除
- **DELETE** `/dishes/{id}`
- 指定したIDの料理を削除

## 実装したファイル

### 1. API Service (`src/services/api.js`)
- `dishAPI`: 新しいCRUD APIの実装
- `menuAPI`: 後方互換性のためのエイリアス

### 2. Context (`src/context/MenuContext.jsx`)
- 新しいDishモデルに対応
- フォールバック機能（API接続失敗時はローカルデータ使用）
- 完全なCRUD操作のサポート

### 3. Components
- `MenuItem.jsx`: Dishモデルの表示に対応
- `MenuForm.jsx`: 日本語名・英語名の入力フォーム

### 4. Pages
- `EditMenuPage.jsx`: 新しいAPI構造に対応

## 機能

### Create (作成)
- 新しい料理の追加
- 日本語名・英語名・価格・画像URLの入力
- バリデーション機能

### Read (読み取り)
- 料理一覧の表示
- 料理詳細の取得
- 日本語名・英語名での検索

### Update (更新)
- 既存料理の編集
- フォームでの値の事前入力
- 変更の保存

### Delete (削除)
- 料理の削除
- 確認ダイアログ（既存実装）

## 後方互換性

既存のコードとの互換性を保つため、古いデータ構造（`name`, `description`, `category`, `image`）も引き続きサポートしています。

## フォールバック機能

API接続に失敗した場合、以下のフォールバック機能が動作します：
- サンプルデータの表示
- ローカルでのCRUD操作
- エラーメッセージの表示

## 使用方法

1. APIサーバーを `localhost:8080` で起動
2. フロントエンドアプリケーションを起動: `pnpm dev`
3. ブラウザで `http://localhost:5173` にアクセス

APIサーバーが起動していない場合でも、サンプルデータで動作確認が可能です。

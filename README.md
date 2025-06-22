# Cook Order ~ FOR YOU ~

## 目的

本プロジェクトは、「こんな機能があったら良いな」と個人的に感じる機能を実際に実装し、企画設計や UI デザインからシステム構築（CI/CD やデプロイ環境の整備を含む）まで、一連の開発工程を実践的に経験することを目的としています。

## 概要

本システムは、各店舗における料理一覧を管理し、簡単にアップデートできるようにすることを主な目的とした、オンライン料理注文アプリケーションです。

- 料理を作成した方の顔写真を掲載
- チップを送付できる機能（今後実装予定）

## 機能一覧

### クライアントアプリ

- ログイン機能
  - 注文内容の確認
  - 過去の注文履歴の閲覧
  - ゲストユーザー対応
- 料理の注文機能
- チップ送付機能（料理を作ってくれた方、ホールスタッフの方それぞれに送付可能）

### マネジメントアプリ（実装予定）

- 料理メニューの追加・編集機能

将来的には、マネジメントアプリを通じて料理メニューの管理（追加・編集等）が可能となる予定です。

## デプロイ先

将来的には AWS または GCP 上での運用を想定しています。

- [Vercel app](https://cook-order.vercel.app/)

## データベース

本システムのデータベースには、Google Cloud Platform（GCP）の Cloud SQL を利用しています。

- インスタンス ID: `my-postgre`
- 管理画面: [Cloud SQL インスタンス my-postgre](https://console.cloud.google.com/sql/instances/my-postgre/overview?inv=1&invt=Ab0tYg&project=sixth-tempo-458204-q0)

## デザイン

- [**Figma**](https://www.figma.com/design/W2Bu4gVR2UMQ6JQ5j1atbd/Food-Order?node-id=4230-722&p=f&t=F577w9uFQjqcsVOz-0)

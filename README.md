# Mini MarketPlace

FullStack typescript MarketPlace Application

## TechStack
FrontEnd: React+Vite
BackEnd: NestJS
ORM: Prisma
Document: Swagger/OpenAPI

## Directory structure

```text
mini-marketplace/
├── src/                         # メインAPI（NestJS）
│   ├── common/                  # 共通処理（Zod バリデーション）
│   ├── items/                   # 商品のコントローラー・サービス・スキーマ
│   ├── orders/                  # 注文のコントローラー・サービス・スキーマ
│   ├── prisma/                  # Prisma の NestJS モジュールとサービス
│   ├── app.module.ts            # APIモジュールの定義
│   └── main.ts                  # APIの起動点、Swagger の設定
├── prisma/
│   ├── schema.prisma            # SQLite のスキーマ定義
│   ├── migrations/              # Prisma マイグレーション
│   └── dev.db                   # ローカル開発用 SQLite データベース
├── test/                        # API の E2E テスト
├── web/                         # フロントエンド（React + Vite）
│   ├── src/
│   │   ├── lib/api.ts           # API クライアント
│   │   ├── App.tsx              # メイン画面
│   │   └── main.tsx             # React の起動点
│   ├── public/                  # 静的ファイル
│   └── vite.config.ts           # Vite と API プロキシの設定
├── package.json                 # ルートAPI用の npm スクリプト
└── web/package.json             # フロントエンド用の npm スクリプト
```

## 必要環境

- Node.js
- npm

## 起動方法

API とフロントエンドは、それぞれ別のターミナルで起動します。

### 1. API を起動する

ルートディレクトリで依存関係をインストールしてから、開発サーバーを起動します。

```bash
npm install
npm run start:dev
```

API はデフォルトで `http://localhost:3000` で起動します。ポートを変更する場合は `PORT` 環境変数を指定してください。

```bash
PORT=3001   
```

### 2. フロントエンドを起動する

別のターミナルで `web/` に移動し、開発サーバーを起動します。

```bash
cd web
npm install
npm run dev
```

起動後に表示される URL（通常は `http://localhost:5173`）をブラウザで開いてください。

## Swagger

API 起動中は、Swagger UI を次の URL で利用できます。

- `http://localhost:3000/docs`

Swagger の定義は [`src/main.ts`](src/main.ts) で設定しています。

## フロントエンドからの API 接続

フロントエンドは [`web/src/lib/api.ts`](web/src/lib/api.ts) から `/api` を先頭に付けて API を呼び出します。

```text
ブラウザ: /api/items
    ↓ Vite のプロキシ
API:     http://localhost:3000/items
```

このプロキシは [`web/vite.config.ts`](web/vite.config.ts) で設定されています。API のポートを `3001` などに変更した場合は、同ファイルの `target` も変更してください。

## データベース

SQLite のデータベースファイルは `prisma/dev.db` です。スキーマを変更した場合は、Prisma のマイグレーションを作成・適用します。

```bash
npx prisma migrate dev --name <migration-name>
```

## よく使うコマンド

```bash
# API
npm run start:dev    # 開発サーバー（ファイル監視）
npm run build        # ビルド
npm run test         # ユニットテスト
npm run test:e2e     # E2E テスト

# フロントエンド（web/ 内で実行）
npm run dev          # 開発サーバー
npm run build        # 本番ビルド
npm run lint         # Lint
```

# Time Tracker Backend API

工数管理アプリケーションのバックエンドAPI。Clean ArchitectureとTDDを採用したNode.js/Express + TypeScript + Prismaによる実装。

## 📋 目次

- [技術スタック](#技術スタック)
- [アーキテクチャ](#アーキテクチャ)  
- [プロジェクト構造](#プロジェクト構造)
- [セットアップ](#セットアップ)
- [開発環境](#開発環境)
- [API仕様](#api仕様)
- [データベース設計](#データベース設計)
- [テスト](#テスト)
- [コーディング規約](#コーディング規約)

## 🛠️ 技術スタック

### Core Technologies
- **Node.js** 20.x
- **TypeScript** 5.x - 型安全性とモダンな開発体験
- **Express.js** 4.x - 高性能Webフレームワーク

### データベース・ORM
- **PostgreSQL** - Supabaseインスタンス使用
- **Prisma** 6.x - タイプセーフなORM
- **UUID v4** - 主キーとして使用

### 品質保証・ツール
- **Jest** - ユニット・統合テスト
- **SuperTest** - APIエンドポイントテスト
- **ESLint** - コード静的解析
- **TypeScript** - 型チェック
- **Winston** - 構造化ログ

### セキュリティ
- **Helmet.js** - HTTPセキュリティヘッダー
- **CORS** - クロスオリジン制御
- **Joi** - 入力値バリデーション

## 🏗️ アーキテクチャ

### Clean Architecture準拠設計

```
┌─────────────────────────────────────┐
│      Presentation Layer             │  ← Controllers, Routes
├─────────────────────────────────────┤
│      Application Layer              │  ← Use Cases, Services  
├─────────────────────────────────────┤
│      Domain Layer                   │  ← Entities, Value Objects
├─────────────────────────────────────┤
│      Infrastructure Layer           │  ← Database, Repositories
└─────────────────────────────────────┘
```

### 依存性の方向
- 外側から内側への単方向依存
- Domain層は他のレイヤーに依存しない
- Repository パターンによるDB抽象化

## 📁 プロジェクト構造

```
server/
├── prisma/                    # Prisma設定とマイグレーション
│   ├── migrations/           # データベースマイグレーション
│   └── schema.prisma         # データベーススキーマ定義
├── src/
│   ├── application/          # Application Layer
│   │   ├── interfaces/      # インターフェース定義
│   │   ├── services/        # アプリケーションサービス
│   │   └── use-cases/       # ユースケース実装
│   ├── domain/              # Domain Layer
│   │   ├── entities/        # ドメインエンティティ
│   │   ├── value-objects/   # 値オブジェクト
│   │   └── repositories/    # リポジトリインターフェース
│   ├── infrastructure/      # Infrastructure Layer
│   │   ├── database/        # DB接続設定
│   │   └── repositories/    # リポジトリ実装
│   ├── presentation/        # Presentation Layer
│   │   ├── controllers/     # HTTPコントローラー
│   │   ├── routes/          # ルート定義
│   │   └── middleware/      # ミドルウェア
│   ├── shared/             # 共通機能
│   │   ├── constants/      # 定数定義
│   │   ├── types/          # 共通型定義
│   │   └── utils/          # ユーティリティ
│   ├── scripts/            # 運用スクリプト
│   ├── __tests__/          # テストファイル
│   └── index.ts            # エントリーポイント
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## ⚡ セットアップ

### 前提条件
- Node.js 20.x以上
- npm または yarn
- PostgreSQL データベース（Supabase推奨）

### インストール

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .env ファイルを編集してSupabaseの接続情報を設定

# Prismaクライアントの生成
npx prisma generate

# データベースのマイグレーション実行
npx prisma migrate dev

# 初期データの投入（オプション）
npm run seed
```

### 環境変数

```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# Server
NODE_ENV="development"
PORT=3001

# API Keys (将来のSupabase Auth用)
SUPABASE_URL=""
SUPABASE_SERVICE_ROLE_KEY=""
```

## 🚀 開発環境

### 開発サーバーの起動

```bash
# 開発モード（ホットリロード）
npm run dev

# プロダクションビルド
npm run build
npm start
```

### 利用可能なスクリプト

```bash
npm run dev         # 開発サーバー起動（ts-node-dev）
npm run build       # TypeScriptコンパイル
npm run start       # プロダクションサーバー起動
npm run test        # テスト実行
npm run test:watch  # テスト監視モード
npm run test:coverage # カバレッジ付きテスト
npm run lint        # ESLint実行
npm run lint:fix    # ESLint自動修正
npm run type-check  # TypeScript型チェック
npm run seed        # 初期データ投入
```

## 🌐 API仕様

### ベースURL
- 開発環境: `http://localhost:3001/api`
- 本番環境: `https://your-domain.com/api`

### エンドポイント一覧

#### ユーザー管理
```
GET    /api/users                    # ユーザー一覧取得
POST   /api/users                    # ユーザー作成
GET    /api/users/:id               # ユーザー詳細取得
PUT    /api/users/:id               # ユーザー更新
DELETE /api/users/:id               # ユーザー削除
```

#### プロジェクト管理
```
GET    /api/projects?userId=:id      # プロジェクト一覧取得
POST   /api/projects                 # プロジェクト作成
GET    /api/projects/:id            # プロジェクト詳細取得
PUT    /api/projects/:id            # プロジェクト更新
DELETE /api/projects/:id            # プロジェクト削除
```

#### タスク管理
```
GET    /api/tasks?userId=:id         # タスク一覧取得
POST   /api/tasks                    # タスク作成
GET    /api/tasks/:id               # タスク詳細取得
PUT    /api/tasks/:id               # タスク更新
DELETE /api/tasks/:id               # タスク削除
```

#### 分類管理
```
GET    /api/categories?userId=:id    # 分類一覧取得
POST   /api/categories               # 分類作成
GET    /api/categories/:id          # 分類詳細取得
PUT    /api/categories/:id          # 分類更新
DELETE /api/categories/:id          # 分類削除
```

#### 工数エントリ管理
```
GET    /api/time-entries?userId=:id  # 工数エントリ一覧取得
POST   /api/time-entries             # 工数エントリ作成
GET    /api/time-entries/:id        # 工数エントリ詳細取得
PUT    /api/time-entries/:id        # 工数エントリ更新
DELETE /api/time-entries/:id        # 工数エントリ削除
```

#### レポート・集計
```
GET    /api/reports/:userId/projects     # プロジェクト別工数集計
GET    /api/reports/:userId/categories   # 分類別工数集計
GET    /api/reports/:userId/daily       # 日別工数集計
GET    /api/reports/:userId/detail      # 工数詳細データ
```

### レスポンス形式

#### 成功レスポンス
```json
{
  "success": true,
  "data": {
    // レスポンスデータ
  }
}
```

#### エラーレスポンス
```json
{
  "success": false,
  "error": "エラーメッセージ",
  "details": {
    // 詳細なエラー情報（開発環境のみ）
  }
}
```

## 🗃️ データベース設計

### 主要エンティティ

#### Users（ユーザー）
```sql
- id: UUID (Primary Key)
- name: VARCHAR(100) (NOT NULL)
- email: VARCHAR(255) (UNIQUE)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
- deleted_at: TIMESTAMPTZ (論理削除)
```

#### Projects（プロジェクト）
```sql
- id: UUID (Primary Key)
- name: VARCHAR(200) (NOT NULL)
- description: TEXT
- color: VARCHAR(7) (デフォルト: #3498db)
- user_id: UUID (Foreign Key)
- metadata: JSONB (拡張用)
```

#### Tasks（タスク）
```sql
- id: UUID (Primary Key)
- name: VARCHAR(200) (NOT NULL)
- description: TEXT
- project_id: UUID (Foreign Key)
- user_id: UUID (Foreign Key)
```

#### Categories（分類）
```sql
- id: UUID (Primary Key)
- name: VARCHAR(100) (NOT NULL)
- description: TEXT
- color: VARCHAR(7)
- user_id: UUID (Foreign Key)
```

#### TimeEntries（工数エントリ）
```sql
- id: UUID (Primary Key)
- date: DATE (NOT NULL)
- start_time: TIMESTAMPTZ (NOT NULL)
- end_time: TIMESTAMPTZ (NOT NULL)
- memo: TEXT
- user_id: UUID (Foreign Key)
- task_id: UUID (Foreign Key)
- category_id: UUID (Foreign Key)
```

### データ制約

#### 15分刻み制約
```sql
-- start_timeとend_timeは15分刻みでのみ許可
CHECK (EXTRACT(minute FROM start_time) % 15 = 0)
CHECK (EXTRACT(minute FROM end_time) % 15 = 0)
```

#### 時間重複防止制約
```sql
-- 同一ユーザーの同時間帯には1エントリのみ
UNIQUE INDEX idx_time_entries_user_time_unique 
ON time_entries (user_id, date, start_time, end_time)
WHERE deleted_at IS NULL
```

## 🧪 テスト

### テスト戦略
- **Unit Tests**: 各Layer単体のロジックテスト
- **Integration Tests**: API・Database連携テスト
- **Contract Tests**: レイヤー間インターフェーステスト

### テスト実行

```bash
# 全テスト実行
npm test

# 監視モード
npm run test:watch

# カバレッジレポート
npm run test:coverage
```

### テスト設定
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/generated/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## 📏 コーディング規約

### TypeScript規約
- **any型禁止** - unknown型を活用
- **アーリーリターン必須** - ネストを深くしない
- **マジックナンバー禁止** - 定数として定義

```typescript
// 良い例: 定数化とアーリーリターン
const VALID_MINUTE_INTERVALS = [0, 15, 30, 45] as const;

function validateTimeEntry(entry: TimeEntryRequest): boolean {
  if (!entry) return false;
  if (!entry.startTime) return false;
  if (!entry.endTime) return false;
  
  const minutes = entry.startTime.getMinutes();
  return VALID_MINUTE_INTERVALS.includes(minutes);
}
```

### 関数設計原則
- **単一責任の原則** - 1つの関数は1つの責任のみ
- **20行以内推奨** - 複雑な処理は分割
- **引数3つ以内** - オブジェクト引数を活用

### エラーハンドリング
- **カスタム例外クラス活用**
- **ログ出力の統一** - Winstonによる構造化ログ
- **スタックトレースの保持**

```typescript
// カスタム例外例
export class BusinessRuleViolationError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'BusinessRuleViolationError';
  }
}
```

## 🔄 開発フロー

### TDD サイクル
1. **RED**: 失敗するテストを先に作成
2. **GREEN**: 最小限の実装でテストを通す
3. **REFACTOR**: コードを整理・改善

### Git フロー
- `main` ブランチ: プロダクション用
- `develop` ブランチ: 開発統合用  
- `feature/*` ブランチ: 機能開発用

### コミット規約
```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
refactor: リファクタリング
test: テスト追加・修正
```

## 🚨 トラブルシューティング

### よくある問題

#### Prismaクライアント生成エラー
```bash
# Prismaクライアントを再生成
npx prisma generate
```

#### データベース接続エラー
```bash
# 接続テスト
npx prisma db pull
```

#### 型エラー
```bash
# 型チェック実行
npm run type-check
```

## 🔮 今後の拡張予定

### Phase 1: セキュリティ強化
- Supabase Auth統合
- Row Level Security (RLS)
- 権限ベースアクセス制御

### Phase 2: 機能拡張
- CSV/Excel/JSONエクスポート
- 通知・リマインダー機能
- 高度な集計・分析機能

### Phase 3: パフォーマンス最適化
- Redis キャッシング
- データベースインデックス最適化
- GraphQL API対応

## 📞 サポート

開発に関する質問や問題は、プロジェクトのIssueトラッカーで報告してください。

---

📝 このREADMEは開発チーム向けの技術仕様書です。更新は随時行ってください。
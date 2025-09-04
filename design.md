# システム設計書

## 1. アーキテクチャ概要

### 1.1 全体構成
```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Presentation  │  │   Components    │  │   Hooks      │ │
│  │     Layer       │  │                 │  │              │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                           HTTP/REST API
                                │
┌─────────────────────────────────────────────────────────────┐
│                     Backend (Node.js/Express)               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Presentation   │  │   Application   │  │   Domain     │ │
│  │     Layer       │  │      Layer      │  │    Layer     │ │
│  │   (Controllers) │  │   (Use Cases)   │  │  (Entities)  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Infrastructure Layer                       │ │
│  │            (Repository, Database Access)                │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                         Supabase PostgreSQL
```

### 1.2 Clean Architecture適用
- **Domain Layer**: エンティティとビジネスルール
- **Application Layer**: ユースケースとアプリケーションサービス
- **Infrastructure Layer**: データベース・外部API
- **Presentation Layer**: コントローラー・UI

## 2. フロントエンド設計（React）

### 2.1 技術スタック
- **Framework**: React 18+ + TypeScript
- **UI Library**: React Bootstrap 5
- **Routing**: React Router DOM
- **Calendar**: react-big-calendar
- **State Management**: React Context API + useReducer
- **HTTP Client**: カスタムapiClient
- **Testing**: Jest + React Testing Library
- **Type Safety**: TypeScript
- **Styling**: CSS Modules + Bootstrap Classes

### 2.2 ディレクトリ構成
```
front/                          # フロントエンド実装
├── public/                     # 静的ファイル
├── src/
│   ├── components/            # 共通コンポーネント
│   │   ├── common/           # 汎用コンポーネント
│   │   ├── calendar/         # カレンダー関連
│   │   ├── forms/            # フォーム関連
│   │   ├── layout/           # レイアウト関連
│   │   ├── AdminList.tsx     # 汎用一覧コンポーネント
│   │   ├── Navigation.tsx    # ナビゲーション
│   │   ├── Calendar.tsx      # メインカレンダー
│   │   ├── *CreateModal.tsx  # 作成モーダル群
│   │   ├── *DetailModal.tsx  # 詳細モーダル群
│   │   ├── *List.tsx         # 一覧コンポーネント群
│   │   └── *Selector.tsx     # セレクター群
│   ├── pages/                # ページコンポーネント
│   │   ├── UserSelection.tsx # ユーザー選択画面
│   │   ├── TimeEntry.tsx     # 工数入力画面
│   │   ├── Reports.tsx       # 集計・分析画面
│   │   └── Admin.tsx         # 管理画面
│   ├── context/              # Context API
│   ├── services/             # API通信
│   ├── types/                # TypeScript型定義
│   ├── styles/               # スタイルシート
│   ├── utils/                # ユーティリティ
│   └── __tests__/            # テスト
```

### 2.3 主要コンポーネント設計

#### 2.3.1 CalendarComponent
**ファイル**: `front/src/components/Calendar.tsx`
```typescript
// react-big-calendar を使用したメインカレンダーコンポーネント
// 機能：
// - 15分刻みの時間スロット生成
// - ドラッグ&ドロップ処理（作成・移動・リサイズ）
// - 時間重複バリデーション・確認ダイアログ
// - 週表示形式・24時間対応
// - プロジェクト・分類色による視覚的表現
```

#### 2.3.2 TaskSelector（2段階選択コンポーネント）
**ファイル**: 
- `front/src/components/ProjectSelector.tsx`
- `front/src/components/TaskSelector.tsx` 
- `front/src/components/CategorySelector.tsx`

```typescript
// 機能：
// - プロジェクト選択 → タスク選択の2段階選択UI
// - 分類選択（プロジェクト横断）
// - カラーピッカー・色表示機能
// - バリデーション・エラーハンドリング完備
// - TypeScript による型安全性確保
```

#### 2.3.3 ReportsComponent
**ファイル**: `front/src/pages/Reports.tsx`
```typescript
// 機能：
// - 4種類のレポート（プロジェクト別・分類別・日別・詳細）
// - タブ式UI による直感的な操作
// - 期間選択（今月・先月・過去30日・カスタム期間）
// - ユーザー選択機能（動的ユーザー切り替え）
// - カラーバッジによる視覚的表現
// - ローディング状態・エラーハンドリング
```

### 2.4 状態管理設計
**ファイル**: `front/src/context/AppContext.tsx`
```typescript
// React Context API + useReducer による状態管理
// - AppProvider による全体状態管理
// - TypeScript による型安全な Action/State 定義
// - ユーザー選択状態・エラー状態・ローディング状態管理
// - 各コンポーネントから useAppContext フック でアクセス
// - プロジェクト・分類・タスク・工数データの統合管理
```

#### 2.4.1 管理画面コンポーネント群
```typescript
// AdminList.tsx - 汎用一覧コンポーネント
// - 検索・ソート・フィルタリング・ページング機能
// - Generic型による型安全な再利用可能設計
// - カスタムレンダリング対応

// *CreateModal.tsx 群 - 統一的な作成モーダル
// - ProjectCreateModal, CategoryCreateModal, TaskCreateModal, UserCreateModal
// - カラーピッカー・プレビュー・バリデーション機能完備

// *DetailModal.tsx 群 - 統一的な詳細・削除モーダル  
// - 2段階確認削除・カード化レイアウト
// - エラーハンドリング・ローディング状態完備
```

## 3. バックエンド設計（Clean Architecture）

### 3.1 技術スタック
- **Framework**: Express.js + TypeScript
- **ORM**: Prisma (Supabase対応)
- **Security**: Helmet + CORS
- **Architecture**: Clean Architecture
- **Validation**: カスタムバリデーション
- **Testing**: Jest + Supertest
- **API Documentation**: Swagger/OpenAPI
- **Logging**: Winston

### 3.2 ディレクトリ構成
```
server/                          # バックエンド実装
├── src/
│   ├── domain/              # Domain Layer
│   │   ├── entities/        # エンティティ（User, Project, Category, Task, TimeEntry）
│   │   ├── repositories/    # リポジトリインターフェース
│   │   └── value-objects/   # 値オブジェクト（TimePeriod等）
│   ├── application/         # Application Layer
│   │   ├── use-cases/       # ユースケース
│   │   ├── services/        # アプリケーションサービス
│   │   └── interfaces/      # インターフェース定義
│   ├── infrastructure/      # Infrastructure Layer
│   │   ├── database/        # データベースアクセス（Prisma実装）
│   │   ├── repositories/    # リポジトリ実装
│   │   └── external/        # 外部API対応ディレクトリ
│   ├── presentation/        # Presentation Layer
│   │   ├── controllers/     # コントローラー
│   │   ├── middlewares/     # ミドルウェア（CORS, Helmet等）
│   │   ├── routes/          # ルート定義（RESTful API）
│   │   └── validators/      # バリデーション
│   ├── shared/              # 共通機能
│   │   ├── utils/           # ユーティリティ
│   │   ├── constants/       # 定数（時間制約等）
│   │   └── types/           # 型定義
│   ├── scripts/             # データベースシード等
│   └── __tests__/           # テスト
```

### 3.3 Domain Layer設計

#### 3.3.1 エンティティ
```typescript
// User Entity
export class User {
  private constructor(
    public readonly id: UserId,
    public readonly name: UserName,
    public readonly email: Email,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt?: Date
  ) {}

  static create(name: string, email: string): User {
    return new User(
      UserId.generate(),
      new UserName(name),
      new Email(email),
      new Date(),
      new Date()
    );
  }

  delete(): User {
    return new User(
      this.id,
      this.name,
      this.email,
      this.createdAt,
      new Date(),
      new Date()
    );
  }
}

// TimeEntry Entity  
export class TimeEntry {
  private constructor(
    public readonly id: TimeEntryId,
    public readonly taskId: TaskId,
    public readonly categoryId: CategoryId,
    public readonly userId: UserId,
    public readonly period: TimePeriod,
    public readonly memo?: string
  ) {}

  static create(
    taskId: TaskId,
    categoryId: CategoryId,
    userId: UserId,
    startTime: Date,
    endTime: Date,
    memo?: string
  ): TimeEntry {
    const period = TimePeriod.create(startTime, endTime);
    return new TimeEntry(
      TimeEntryId.generate(),
      taskId,
      categoryId,
      userId,
      period,
      memo
    );
  }
}
```

#### 3.3.2 値オブジェクト
```typescript
// 時間期間を管理する値オブジェクト
// コーディング規約適用：定数化、エラーメッセージの定数化
const FIFTEEN_MINUTES_IN_MS = 15 * 60 * 1000;
const HOUR_IN_MS = 60 * 60 * 1000;
const VALID_MINUTE_INTERVALS = [0, 15, 30, 45] as const;

const ERROR_MESSAGES = {
  INVALID_TIME_ORDER: '開始時間は終了時間より前である必要があります',
  INVALID_15MIN_INTERVAL: '時間は15分刻みである必要があります'
} as const;

export class TimePeriod {
  private constructor(
    public readonly startTime: Date,
    public readonly endTime: Date
  ) {
    // アーリーリターン適用
    if (startTime >= endTime) {
      throw new TimePeriodError(ERROR_MESSAGES.INVALID_TIME_ORDER);
    }
    
    if (!this.is15MinuteInterval(startTime) || !this.is15MinuteInterval(endTime)) {
      throw new TimePeriodError(ERROR_MESSAGES.INVALID_15MIN_INTERVAL);
    }
  }

  static create(startTime: Date, endTime: Date): TimePeriod {
    return new TimePeriod(startTime, endTime);
  }

  private is15MinuteInterval(date: Date): boolean {
    return VALID_MINUTE_INTERVALS.includes(date.getMinutes() as typeof VALID_MINUTE_INTERVALS[number]);
  }

  getDurationInHours(): number {
    return (this.endTime.getTime() - this.startTime.getTime()) / HOUR_IN_MS;
  }

  overlaps(other: TimePeriod): boolean {
    // アーリーリターンでシンプルに
    if (this.startTime >= other.startTime && this.startTime < other.endTime) return true;
    if (this.endTime > other.startTime && this.endTime <= other.endTime) return true;
    if (this.startTime <= other.startTime && this.endTime >= other.endTime) return true;
    
    return false;
  }
}

// カスタム例外クラスの活用
export class TimePeriodError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimePeriodError';
  }
}
```

### 3.4 Application Layer設計

#### 3.4.1 ユースケース例（コーディング規約適用版）
```typescript
// 定数化・カスタム例外クラス活用
const MAX_FUNCTION_ARGS = 3; // 引数数制限の指針

export class CreateTimeEntryUseCase {
  constructor(
    private timeEntryRepository: ITimeEntryRepository,
    private taskRepository: ITaskRepository,
    private categoryRepository: ICategoryRepository
  ) {}

  async execute(request: CreateTimeEntryRequest): Promise<TimeEntryResponse> {
    // アーリーリターン適用 - バリデーション
    await this.validateRequest(request);

    // 時間重複チェック - 副作用の分離
    await this.checkTimeOverlap(request);

    // 工数エントリ作成・保存
    return this.createAndSaveTimeEntry(request);
  }

  // 単一責任の原則適用 - バリデーションロジックを分離
  private async validateRequest(request: CreateTimeEntryRequest): Promise<void> {
    // アーリーリターンでネスト回避
    const task = await this.taskRepository.findById(new TaskId(request.taskId));
    if (!task) {
      throw new TaskNotFoundError(`Task not found: ${request.taskId}`);
    }

    const category = await this.categoryRepository.findById(new CategoryId(request.categoryId));
    if (!category) {
      throw new CategoryNotFoundError(`Category not found: ${request.categoryId}`);
    }
  }

  // 単一責任の原則適用 - 重複チェックを分離
  private async checkTimeOverlap(request: CreateTimeEntryRequest): Promise<void> {
    const period = TimePeriod.create(request.startTime, request.endTime);
    const overlappingEntries = await this.timeEntryRepository
      .findOverlappingEntries(new UserId(request.userId), period);
    
    if (overlappingEntries.length > 0) {
      throw new TimeOverlapError(`Time overlap detected for user: ${request.userId}`);
    }
  }

  // 単一責任の原則適用 - 作成・保存を分離
  private async createAndSaveTimeEntry(request: CreateTimeEntryRequest): Promise<TimeEntryResponse> {
    const timeEntry = TimeEntry.create(
      new TaskId(request.taskId),
      new CategoryId(request.categoryId),
      new UserId(request.userId),
      request.startTime,
      request.endTime,
      request.memo
    );

    const savedEntry = await this.timeEntryRepository.save(timeEntry);
    return TimeEntryResponse.from(savedEntry);
  }
}

// カスタム例外クラスの活用
export class TaskNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TaskNotFoundError';
  }
}

export class CategoryNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CategoryNotFoundError';
  }
}

export class TimeOverlapError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeOverlapError';
  }
}
```

### 3.5 API設計

#### 3.5.1 RESTful API エンドポイント
```
GET    /health                          # ヘルスチェック

GET    /api/users                       # ユーザー一覧
POST   /api/users                       # ユーザー作成
DELETE /api/users/:id                   # ユーザー削除

GET    /api/projects                    # プロジェクト一覧（ユーザー指定）
POST   /api/projects                    # プロジェクト作成
DELETE /api/projects/:id                # プロジェクト削除

GET    /api/categories                  # 分類一覧（ユーザー指定）
POST   /api/categories                  # 分類作成
DELETE /api/categories/:id              # 分類削除

GET    /api/tasks                       # タスク一覧（プロジェクト・ユーザー指定）
POST   /api/tasks                       # タスク作成
DELETE /api/tasks/:id                   # タスク削除

GET    /api/time-entries                # 工数一覧（ユーザー・期間指定）
POST   /api/time-entries                # 工数作成
PUT    /api/time-entries/:id            # 工数更新
DELETE /api/time-entries/:id            # 工数削除

GET    /api/reports/projects/:userId    # プロジェクト別集計
GET    /api/reports/categories/:userId  # 分類別集計
GET    /api/reports/daily/:userId       # 日別集計
GET    /api/reports/details/:userId     # 工数詳細レポート

PUT    /api/projects/:id                # プロジェクト更新
PUT    /api/categories/:id              # 分類更新
PUT    /api/tasks/:id                   # タスク更新
```

## 4. TDD実装アプローチ

### 4.1 テスト戦略
1. **Unit Tests**: Domain層・Application層の単体テスト
2. **Integration Tests**: API・データベース連携テスト
3. **E2E Tests**: フロントエンド・バックエンド結合テスト

### 4.2 TDDサイクル
```
RED → GREEN → REFACTOR の繰り返し
```

#### 4.2.1 バックエンド TDD例
```typescript
// 1. RED: 失敗するテストを書く
describe('CreateTimeEntryUseCase', () => {
  it('should create time entry when valid request', async () => {
    // Arrange
    const request = new CreateTimeEntryRequest(
      'task-id',
      'category-id',
      'user-id',
      new Date('2025-01-01 09:00:00'),
      new Date('2025-01-01 09:15:00')
    );

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result.id).toBeDefined();
    expect(result.taskId).toBe('task-id');
    expect(result.categoryId).toBe('category-id');
  });
});

// 2. GREEN: 最小限の実装でテストを通す
// 3. REFACTOR: コードを整理・改善
```

### 4.3 テストの品質基準
- **カバレッジ**: 80%以上
- **境界値テスト**: 15分刻み、時間重複等
- **異常系テスト**: バリデーションエラー、業務例外

### 4.4 実装時のコーディング規約適用例
```typescript
// ❌ 悪い例：ネストが深い、マジックナンバー使用
function validateTimeEntry(entry: any): boolean {
  if (entry) {
    if (entry.startTime) {
      if (entry.endTime) {
        if (entry.endTime > entry.startTime) {
          const minutes = entry.startTime.getMinutes();
          if (minutes === 0 || minutes === 15 || minutes === 30 || minutes === 45) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

// ✅ 良い例：アーリーリターン、定数化、型安全
const VALID_MINUTE_INTERVALS = [0, 15, 30, 45] as const;

function validateTimeEntry(entry: TimeEntryRequest): boolean {
  if (!entry) return false;
  if (!entry.startTime) return false;
  if (!entry.endTime) return false;
  if (entry.endTime <= entry.startTime) return false;
  
  const startMinutes = entry.startTime.getMinutes();
  const endMinutes = entry.endTime.getMinutes();
  
  return VALID_MINUTE_INTERVALS.includes(startMinutes) && 
         VALID_MINUTE_INTERVALS.includes(endMinutes);
}
```

## 5. セキュリティ設計

### 5.1 認証・認可（将来対応）
- **JWT**: トークンベース認証
- **Role-Based Access**: ユーザー権限管理
- **CORS**: Cross-Origin Resource Sharing設定

### 5.2 バリデーション
- **入力検証**: すべてのAPI入力値検証
- **型安全**: TypeScript活用
- **SQLインジェクション**: Prisma ORM使用

## 6. パフォーマンス設計

### 6.1 フロントエンド最適化
- **Code Splitting**: ページ単位の遅延読み込み
- **Memoization**: React.memo、useMemo活用
- **Virtual Scrolling**: 大量データ対応

#### 6.1.1 コーディング規約適用のパフォーマンス最適化例
```typescript
// ✅ React.memo + アーリーリターンでの最適化
const EMPTY_ARRAY = [] as const; // 定数化

interface TimeEntryItemProps {
  entry: TimeEntry;
  onUpdate: (entry: TimeEntry) => void;
  onDelete: (id: string) => void;
}

export const TimeEntryItem = React.memo<TimeEntryItemProps>(({ 
  entry, 
  onUpdate, 
  onDelete 
}) => {
  // アーリーリターンでの条件分岐
  if (!entry) return null;
  if (!entry.id) return null;

  const handleUpdate = useCallback((updatedEntry: TimeEntry) => {
    // 型安全性確保
    if (!updatedEntry?.id) return;
    onUpdate(updatedEntry);
  }, [onUpdate]);

  const handleDelete = useCallback(() => {
    onDelete(entry.id);
  }, [entry.id, onDelete]);

  return (
    <div className="time-entry-item">
      {/* JSX content */}
    </div>
  );
});

// コンポーネント名の設定（デバッグ用）
TimeEntryItem.displayName = 'TimeEntryItem';
```

### 6.2 バックエンド最適化
- **Database Index**: 適切なインデックス設計
- **Caching**: Redis活用（将来対応）
- **Query Optimization**: N+1問題対策

## 7. 開発・運用

### 7.1 開発環境
- **Local**: Node.js + npm開発サーバー
- **Database**: Supabase PostgreSQL
- **Frontend**: React 18+ + TypeScript + React Bootstrap
- **Backend**: Node.js/Express + TypeScript + Prisma ORM
- **Staging**: Vercel + Supabase
- **Production**: Vercel + Supabase

### 7.2 CI/CD
- **Testing**: GitHub Actions
- **Linting**: ESLint + Prettier
- **Deployment**: 自動デプロイ

## 8. 機能仕様

### 8.1 基盤技術
- **アーキテクチャ**: Clean Architecture 4層構造
- **フロントエンド**: React 18 + TypeScript + React Bootstrap + React Router
- **バックエンド**: Node.js/Express + TypeScript + Prisma + Supabase
- **セキュリティ**: CORS + Helmet ミドルウェア

### 8.2 コア機能
1. **ユーザー管理**: 作成・選択・一覧・削除・動的ユーザー切り替え
2. **プロジェクト管理**: 作成・一覧・削除・カラー管理・検索ソート
3. **分類管理**: 作成・一覧・削除・15色カラー・プロジェクト横断対応
4. **タスク管理**: 作成・一覧・削除・プロジェクト連動・説明改行表示
5. **工数入力**: カレンダーUI・ドラッグ&ドロップ・15分刻み・重複防止
6. **レポート機能**: 4種類集計・期間指定・タイムゾーン対応

### 8.3 UI/UX機能
- **統合ナビゲーション**: React Bootstrap Navbar + アクティブ表示
- **管理画面**: タブ式統合管理・検索ソートフィルタリング
- **モーダル群**: 作成・詳細・削除の統一UI・カラーピッカー対応
- **レスポンシブ**: React Bootstrap によるモバイル対応

### 8.4 認証・セキュリティ
- **ログイン機能**: Supabase Auth・RLS対応
- **権限管理**: Role-Based Access Control

### 8.5 データ活用・運用
- **エクスポート機能**: CSV/Excel/JSON形式データ出力
- **グラフ表示**: Chart.js/Recharts によるビジュアル表示
- **通知機能**: 工数入力リマインダー・メール通知
- **テスト**: Jest + Supertest + React Testing Library
- **CI/CD**: GitHub Actions + 自動デプロイ
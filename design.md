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
- **Framework**: React 18+
- **UI Library**: React Bootstrap 5
- **Drag & Drop**: react-beautiful-dnd
- **Calendar**: react-big-calendar or カスタム実装（週表示形式）
- **State Management**: React Context API + useReducer
- **HTTP Client**: Axios
- **Testing**: Jest + React Testing Library
- **Type Safety**: TypeScript

### 2.2 ディレクトリ構成
```
front/
├── public/
├── src/
│   ├── components/           # 共通コンポーネント
│   │   ├── common/          # 汎用コンポーネント
│   │   ├── calendar/        # カレンダー関連
│   │   ├── forms/           # フォーム関連
│   │   └── layout/          # レイアウト関連
│   ├── pages/               # ページコンポーネント
│   │   ├── TimeEntry/       # 工数入力画面
│   │   ├── Reports/         # 集計・分析画面
│   │   └── Settings/        # 設定画面
│   ├── hooks/               # カスタムフック
│   ├── context/             # Context API
│   ├── services/            # API通信
│   ├── types/               # TypeScript型定義
│   ├── utils/               # ユーティリティ
│   └── __tests__/           # テスト
```

### 2.3 主要コンポーネント設計

#### 2.3.1 CalendarComponent
```typescript
interface CalendarProps {
  entries: TimeEntry[];
  onEntryCreate: (entry: CreateTimeEntryRequest) => void;
  onEntryUpdate: (id: string, entry: UpdateTimeEntryRequest) => void;
  onEntryDelete: (id: string) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const CalendarComponent: React.FC<CalendarProps> = ({...}) => {
  // 15分刻みの時間スロット生成
  // ドラッグ&ドロップ処理
  // 時間重複バリデーション
};
```

#### 2.3.2 TaskSelector（2段階選択コンポーネント）
```typescript
interface TaskSelectorProps {
  projects: Project[];
  tasks: Task[];
  selectedProject?: Project;
  selectedTask?: Task;
  onProjectSelect: (project: Project) => void;
  onTaskSelect: (task: Task) => void;
}

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory?: Category;
  onCategorySelect: (category: Category) => void;
}
```

#### 2.3.3 ReportsComponent
```typescript
interface ReportsProps {
  period: ReportPeriod;
  groupBy: 'project' | 'category' | 'project-category';
  selectedProjects?: Project[];
  selectedCategories?: Category[];
  onPeriodChange: (period: ReportPeriod) => void;
  onGroupByChange: (groupBy: 'project' | 'category' | 'project-category') => void;
  onProjectSelectionChange: (projects: Project[]) => void;
  onCategorySelectionChange: (categories: Category[]) => void;
}
```

### 2.4 状態管理設計
```typescript
// Context定義
interface AppState {
  user: User | null;
  projects: Project[];
  categories: Category[];
  tasks: Task[];
  timeEntries: TimeEntry[];
  loading: boolean;
  error: string | null;
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

// Action定義
type AppAction = 
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TIME_ENTRY'; payload: TimeEntry }
  | { type: 'UPDATE_TIME_ENTRY'; payload: { id: string; entry: TimeEntry } }
  | { type: 'DELETE_TIME_ENTRY'; payload: string }
  | { type: 'SELECT_PROJECT'; payload: Project | null }
  | { type: 'SELECT_CATEGORY'; payload: Category | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };
```

## 3. バックエンド設計（Clean Architecture）

### 3.1 技術スタック
- **Framework**: Express.js + TypeScript
- **ORM**: Prisma (Supabase対応)
- **Validation**: Joi
- **Testing**: Jest + Supertest
- **API Documentation**: Swagger/OpenAPI
- **Logging**: Winston

### 3.2 ディレクトリ構成
```
server/
├── src/
│   ├── domain/              # Domain Layer
│   │   ├── entities/        # エンティティ
│   │   ├── repositories/    # リポジトリインターface
│   │   └── value-objects/   # 値オブジェクト
│   ├── application/         # Application Layer
│   │   ├── use-cases/       # ユースケース
│   │   ├── services/        # アプリケーションサービス
│   │   └── interfaces/      # インターフェース定義
│   ├── infrastructure/      # Infrastructure Layer
│   │   ├── database/        # データベースアクセス
│   │   ├── repositories/    # リポジトリ実装
│   │   └── external/        # 外部API
│   ├── presentation/        # Presentation Layer
│   │   ├── controllers/     # コントローラー
│   │   ├── middlewares/     # ミドルウェア
│   │   ├── routes/          # ルート定義
│   │   └── validators/      # バリデーション
│   ├── shared/              # 共通機能
│   │   ├── utils/           # ユーティリティ
│   │   ├── constants/       # 定数
│   │   └── types/           # 型定義
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
GET    /api/users                     # ユーザー一覧
POST   /api/users                     # ユーザー作成

GET    /api/projects                  # プロジェクト一覧
POST   /api/projects                  # プロジェクト作成
PUT    /api/projects/:id              # プロジェクト更新
DELETE /api/projects/:id              # プロジェクト削除

GET    /api/categories                # 分類一覧
POST   /api/categories                # 分類作成
PUT    /api/categories/:id            # 分類更新
DELETE /api/categories/:id            # 分類削除

GET    /api/tasks                     # タスク一覧
POST   /api/tasks                     # タスク作成
PUT    /api/tasks/:id                 # タスク更新
DELETE /api/tasks/:id                 # タスク削除

GET    /api/time-entries              # 工数一覧
POST   /api/time-entries              # 工数作成
PUT    /api/time-entries/:id          # 工数更新
DELETE /api/time-entries/:id          # 工数削除

GET    /api/reports/projects          # プロジェクト別集計
GET    /api/reports/categories        # 分類別集計
GET    /api/reports/users             # ユーザー別集計
GET    /api/reports/project-category  # プロジェクト×分類クロス集計
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
- **Local**: Docker Compose
- **Staging**: Vercel + Supabase
- **Production**: Vercel + Supabase

### 7.2 CI/CD
- **Testing**: GitHub Actions
- **Linting**: ESLint + Prettier
- **Deployment**: 自動デプロイ
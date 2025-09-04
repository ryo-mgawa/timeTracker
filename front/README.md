# Time Tracker Frontend

工数管理アプリケーションのフロントエンド。React + TypeScript + React BootstrapによるモダンなSPA実装。

## 📋 目次

- [技術スタック](#技術スタック)
- [アーキテクチャ](#アーキテクチャ)  
- [プロジェクト構造](#プロジェクト構造)
- [セットアップ](#セットアップ)
- [開発環境](#開発環境)
- [コンポーネント設計](#コンポーネント設計)
- [状態管理](#状態管理)
- [スタイリング](#スタイリング)
- [テスト](#テスト)
- [ビルド・デプロイ](#ビルド・デプロイ)

## 🛠️ 技術スタック

### Core Technologies
- **React** 18.x - コンポーネントベースUI構築
- **TypeScript** 4.9.x - 型安全性とモダンな開発体験
- **Create React App** 5.x - 開発環境のゼロコンフィグセットアップ

### UI・スタイリング
- **React Bootstrap** 2.9.x - レスポンシブUIコンポーネント
- **Bootstrap** 5.3.x - CSSフレームワーク
- **React Big Calendar** 1.x - 高機能カレンダーコンポーネント
- **React Beautiful DnD** 13.x - ドラッグ&ドロップ機能

### ルーティング・ナビゲーション
- **React Router DOM** 7.x - SPA用ルーティング

### データ管理・通信
- **Axios** 1.6.x - HTTPクライアント
- **Moment.js** 2.30.x - 日付時刻操作

### 品質保証
- **Testing Library** - React用テストユーティリティ
- **Jest** - テストランナー
- **ESLint** - 静的解析ツール
- **Web Vitals** - パフォーマンス計測

## 🏗️ アーキテクチャ

### コンポーネント指向設計

```
┌─────────────────────────────────────┐
│            Pages                    │  ← ページレベルコンポーネント
├─────────────────────────────────────┤
│          Components                 │  ← 再利用可能UIコンポーネント
├─────────────────────────────────────┤
│          Services                   │  ← API通信とビジネスロジック
├─────────────────────────────────────┤
│          Context/Hooks              │  ← 状態管理と副作用
└─────────────────────────────────────┘
```

### 設計原則
- **Container/Presentational Pattern** - ロジックとUIの分離
- **Custom Hooks** - ロジックの再利用性向上
- **Compound Component Pattern** - 複雑なUIの構造化

## 📁 プロジェクト構造

```
front/
├── public/                    # 静的ファイル
│   ├── index.html            # HTMLテンプレート
│   └── favicon.ico           # ファビコン
├── src/
│   ├── components/           # UIコンポーネント
│   │   ├── calendar/        # カレンダー関連
│   │   │   ├── CustomCalendar.tsx
│   │   │   ├── CalendarToolbar.tsx
│   │   │   └── TimeEntryModal.tsx
│   │   ├── common/          # 共通コンポーネント
│   │   │   ├── AdminList.tsx        # 一覧表示コンポーネント
│   │   │   ├── Loading.tsx          # ローディング表示
│   │   │   └── ConfirmDialog.tsx    # 確認ダイアログ
│   │   ├── forms/           # フォーム関連
│   │   │   ├── UserForm.tsx
│   │   │   ├── ProjectForm.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   └── CategoryForm.tsx
│   │   ├── layout/          # レイアウト関連
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── UserList.tsx     # ユーザー一覧
│   │   ├── ProjectList.tsx  # プロジェクト一覧
│   │   ├── TaskList.tsx     # タスク一覧
│   │   ├── CategoryList.tsx # 分類一覧
│   │   └── *DetailModal.tsx # 各エンティティ詳細モーダル
│   ├── pages/               # ページコンポーネント
│   │   ├── CalendarPage.tsx # メインカレンダー画面
│   │   ├── ReportsPage.tsx  # レポート画面
│   │   └── Settings/        # 設定画面群
│   │       ├── SettingsPage.tsx
│   │       ├── UserSettings.tsx
│   │       ├── ProjectSettings.tsx
│   │       ├── TaskSettings.tsx
│   │       └── CategorySettings.tsx
│   ├── context/             # React Context
│   │   ├── UserContext.tsx  # ユーザー状態管理
│   │   └── ThemeContext.tsx # テーマ状態管理
│   ├── hooks/               # カスタムフック
│   │   ├── useApi.ts        # API呼び出し
│   │   ├── useLocalStorage.ts # ローカルストレージ
│   │   └── useDebounce.ts   # デバウンス処理
│   ├── services/            # API通信サービス
│   │   ├── apiClient.ts     # Axiosクライアント設定
│   │   ├── userService.ts   # ユーザーAPI
│   │   ├── projectService.ts # プロジェクトAPI
│   │   ├── taskService.ts   # タスクAPI
│   │   ├── categoryService.ts # 分類API
│   │   ├── timeEntryService.ts # 工数エントリAPI
│   │   └── reportService.ts # レポートAPI
│   ├── types/               # TypeScript型定義
│   │   └── index.ts         # 共通型定義
│   ├── utils/               # ユーティリティ
│   │   ├── dateUtils.ts     # 日付操作
│   │   ├── validation.ts    # バリデーション
│   │   └── constants.ts     # 定数定義
│   ├── styles/              # スタイルファイル
│   │   ├── globals.css      # グローバルスタイル
│   │   └── variables.css    # CSS変数
│   ├── __tests__/          # テストファイル
│   ├── App.tsx             # アプリケーションルート
│   ├── App.css            # アプリケーションスタイル
│   └── index.tsx          # エントリーポイント
├── package.json
├── tsconfig.json
├── .eslintrc.json
└── README.md
```

## ⚡ セットアップ

### 前提条件
- Node.js 16.x以上
- npm または yarn
- バックエンドAPI（`http://localhost:3001`）が起動していること

### インストール

```bash
# 依存関係のインストール
npm install

# 環境変数の設定（オプション）
cp .env.example .env
# 必要に応じて.envファイルを編集

# 開発サーバーの起動
npm start
```

### 環境変数

```bash
# API Endpoint
REACT_APP_API_URL="http://localhost:3001/api"

# Build Configuration
REACT_APP_BUILD_VERSION="1.0.0"
GENERATE_SOURCEMAP=false
```

## 🚀 開発環境

### 開発サーバーの起動

```bash
# 開発モード（ホットリロード）
npm start
# → http://localhost:3000

# プロダクションビルド
npm run build

# テスト実行
npm test
```

### 利用可能なスクリプト

```bash
npm start       # 開発サーバー起動
npm run build   # プロダクションビルド
npm test        # テスト実行（Jest）
npm run eject   # Create React App設定のeject
npm run lint    # ESLint実行
npm run type-check # TypeScript型チェック
```

## 🧩 コンポーネント設計

### コンポーネント分類

#### 1. Pages（ページコンポーネント）
- ルーティングに対応する最上位コンポーネント
- 複数のContainerコンポーネントを組み合わせ
- ページ固有の状態管理

```typescript
// CalendarPage.tsx例
export const CalendarPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  return (
    <div className="calendar-page">
      <CalendarToolbar onUserChange={setSelectedUser} />
      <CustomCalendar userId={selectedUser?.id} />
      <TimeEntryModal />
    </div>
  );
};
```

#### 2. Container Components（コンテナコンポーネント）
- データ取得とビジネスロジック処理
- APIサービスとの連携
- 状態管理とイベントハンドリング

```typescript
// UserList.tsx例
export const UserList: React.FC<UserListProps> = ({ onEdit }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      // エラーハンドリング
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AdminList
      title="ユーザー一覧"
      items={users}
      columns={columns}
      loading={loading}
      onEdit={onEdit}
      onRefresh={fetchUsers}
    />
  );
};
```

#### 3. Presentational Components（プレゼンテーションコンポーネント）
- UI表示に特化（副作用なし）
- propsを受け取り、UIを描画
- 再利用性を重視

```typescript
// AdminList.tsx例
interface AdminListProps<T> {
  readonly title: string;
  readonly items: readonly T[];
  readonly columns: readonly Column<T>[];
  readonly loading: boolean;
  readonly onEdit?: (item: T) => void;
  readonly onRefresh?: () => void;
}

export const AdminList = <T extends ListItem>({
  title,
  items,
  columns,
  loading,
  onEdit,
  onRefresh
}: AdminListProps<T>) => {
  // UI描画ロジックのみ
};
```

### コンポーネント作成原則

#### Props設計
```typescript
// readonly修飾子の活用
interface ComponentProps {
  readonly data: readonly Item[];
  readonly onAction: (id: string) => void;
  readonly config?: Partial<Config>;
}
```

#### イベントハンドリング
```typescript
// useCallbackによる最適化
const handleItemClick = useCallback((item: Item): void => {
  onItemClick?.(item);
}, [onItemClick]);
```

#### 条件付きレンダリング
```typescript
// アーリーリターンの活用
if (loading) return <Loading />;
if (error) return <ErrorDisplay message={error} />;
if (items.length === 0) return <EmptyState />;

return <ItemList items={items} />;
```

## 🏪 状態管理

### React Context使用パターン

#### UserContext（ユーザー状態管理）
```typescript
interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  refreshUsers: () => Promise<void>;
}

export const UserContext = createContext<UserContextType | null>(null);

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within UserProvider');
  }
  return context;
};
```

### カスタムフック活用

#### API呼び出しの抽象化
```typescript
// useApi.ts
export const useApi = <T>(
  apiCall: () => Promise<T>,
  dependencies: DependencyList = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
```

## 🎨 スタイリング

### React Bootstrap活用

#### レスポンシブデザイン
```typescript
// Bootstrapグリッドシステム
<Container>
  <Row>
    <Col xs={12} md={8} lg={6}>
      <MainContent />
    </Col>
    <Col xs={12} md={4} lg={6}>
      <Sidebar />
    </Col>
  </Row>
</Container>
```

#### テーマカスタマイゼーション
```css
/* variables.css */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
  
  --border-radius: 0.375rem;
  --box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

/* カスタムBootstrapテーマ */
.btn-custom {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}
```

### コンポーネント固有スタイル
```typescript
// CSS Modules または styled-components使用推奨
import styles from './Component.module.css';

export const Component: React.FC = () => (
  <div className={styles.container}>
    <h1 className={styles.title}>タイトル</h1>
  </div>
);
```

## 🧪 テスト

### テスト戦略
- **Unit Tests**: 個別コンポーネントのテスト
- **Integration Tests**: コンポーネント間連携テスト
- **E2E Tests**: ユーザージャーニーテスト

### React Testing Library活用

#### コンポーネントテスト例
```typescript
// UserList.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserList } from './UserList';

describe('UserList', () => {
  it('ユーザー一覧が正しく表示される', async () => {
    const mockUsers = [
      { id: '1', name: 'テストユーザー1', email: 'test1@example.com' }
    ];
    
    // モックAPIの設定
    jest.spyOn(userService, 'getUsers').mockResolvedValue(mockUsers);
    
    render(<UserList />);
    
    // ローディング状態の確認
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    
    // データ表示の確認
    await waitFor(() => {
      expect(screen.getByText('テストユーザー1')).toBeInTheDocument();
    });
  });
});
```

#### カスタムフックテスト
```typescript
// useApi.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useApi } from './useApi';

describe('useApi', () => {
  it('API呼び出しが成功した場合、データが取得される', async () => {
    const mockApiCall = jest.fn().mockResolvedValue({ data: 'test' });
    
    const { result } = renderHook(() => useApi(mockApiCall));
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.data).toEqual({ data: 'test' });
    expect(result.current.error).toBe('');
  });
});
```

## 📦 ビルド・デプロイ

### プロダクションビルド

```bash
# 最適化されたビルド作成
npm run build

# ビルド結果確認
ls -la build/
```

### 環境別設定
```javascript
// .env.production
REACT_APP_API_URL=https://api.your-domain.com/api
GENERATE_SOURCEMAP=false
```

### パフォーマンス最適化

#### Code Splitting
```typescript
// React.lazy()による動的import
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));

export const App: React.FC = () => (
  <Router>
    <Routes>
      <Route 
        path="/settings" 
        element={
          <Suspense fallback={<Loading />}>
            <SettingsPage />
          </Suspense>
        } 
      />
    </Routes>
  </Router>
);
```

#### React.memoによる再レンダリング最適化
```typescript
export const ExpensiveComponent = React.memo<Props>(({ data, config }) => {
  // 重い処理を含むコンポーネント
}, (prevProps, nextProps) => {
  // カスタム比較関数
  return prevProps.data === nextProps.data && 
         prevProps.config === nextProps.config;
});
```

## 🔄 開発フロー

### Git ブランチ戦略
- `main`: プロダクション用
- `develop`: 開発統合用
- `feature/*`: 機能開発用

### コミット規約
```
feat: 新機能追加（Feature）
fix: バグ修正（Bug Fix）
style: スタイル調整（UI/UX）
refactor: リファクタリング
test: テスト追加・修正
docs: ドキュメント更新
```

## 🚨 トラブルシューティング

### よくある問題

#### 型エラー
```bash
# TypeScript型チェック
npm run type-check
```

#### ESLintエラー
```bash
# 自動修正可能なエラーを修正
npm run lint:fix
```

#### パッケージ競合
```bash
# node_modulesクリア
rm -rf node_modules package-lock.json
npm install
```

#### メモリ不足エラー
```bash
# Node.jsヒープサイズ増加
NODE_OPTIONS="--max-old-space-size=8192" npm start
```

## 🔮 今後の拡張予定

### Phase 1: UX改善
- ダークモード対応
- 多言語化（i18next）
- アクセシビリティ向上

### Phase 2: 機能拡張
- オフライン対応（Service Worker）
- PWA化
- 高度なフィルタリング・検索

### Phase 3: パフォーマンス最適化
- 仮想化（react-window）
- 画像遅延読み込み
- バンドルサイズ最適化

## 📞 サポート

開発に関する質問や問題は、プロジェクトのIssueトラッカーで報告してください。

---

🎯 このREADMEはフロントエンド開発チーム向けの技術仕様書です。機能追加時は必ず更新してください。
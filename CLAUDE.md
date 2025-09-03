# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

工数管理アプリケーションの開発プロジェクトです。複数ユーザーが作業工数を入力・管理・集計できるWebアプリケーションを、直感的なカレンダーUIとドラッグ&ドロップ操作で実現します。

## アーキテクチャ

### 技術スタック
- **フロントエンド**: React 18+ + TypeScript + React Bootstrap 5
- **バックエンド**: Node.js/Express + TypeScript + Prisma ORM  
- **データベース**: Supabase (PostgreSQL)
- **アーキテクチャ**: Clean Architecture準拠
- **開発手法**: TDD (Test-Driven Development)

### ディレクトリ構成（予定）
```
├── front/                    # React フロントエンド
│   ├── src/
│   │   ├── components/       # UIコンポーネント
│   │   ├── pages/           # ページコンポーネント
│   │   ├── hooks/           # カスタムフック
│   │   ├── context/         # Context API
│   │   ├── services/        # API通信
│   │   └── types/           # TypeScript型定義
└── server/                  # Express バックエンド
    ├── src/
    │   ├── domain/          # Domain Layer (エンティティ・値オブジェクト)
    │   ├── application/     # Application Layer (ユースケース)
    │   ├── infrastructure/  # Infrastructure Layer (リポジトリ実装・DB)
    │   ├── presentation/    # Presentation Layer (コントローラー・ルート)
    │   └── shared/          # 共通機能
```

## データ設計の重要なポイント

### エンティティ関係
- **プロジェクト ← 1:N → タスク**: タスクは特定のプロジェクトに属する
- **分類**: プロジェクト横断で使用可能（独立したエンティティ）
- **工数入力**: 「プロジェクト→タスク」と「分類」を独立して選択

### 時間制約
- **15分刻み**: すべての時間入力は15分単位（0, 15, 30, 45分）
- **重複禁止**: 同じユーザーの同時間帯には1つの工数エントリのみ
- **24時間対応**: 0:00-23:59の範囲で入力可能

## コーディング規約

### 必須ルール
- **アーリーリターンの積極活用**: ネストを深くせず、条件分岐では早期リターンを使用
- **マジックナンバー禁止**: 数値は定数として定義（例: `VALID_MINUTE_INTERVALS = [0, 15, 30, 45] as const`）
- **TypeScript any型禁止**: 適切な型定義を必須とし、unknownを活用
- **関数設計**: 単一責任の原則、20行以内、引数3つ以内を推奨
- **カスタム例外クラス**: エラーハンドリングには専用の例外クラスを活用

### 実装例パターン
```typescript
// 良い例: アーリーリターン + 定数化
const VALID_MINUTE_INTERVALS = [0, 15, 30, 45] as const;

function validateTimeEntry(entry: TimeEntryRequest): boolean {
  if (!entry) return false;
  if (!entry.startTime) return false;
  if (!entry.endTime) return false;
  if (entry.endTime <= entry.startTime) return false;
  
  const startMinutes = entry.startTime.getMinutes();
  return VALID_MINUTE_INTERVALS.includes(startMinutes);
}
```

## UI設計の特徴

### カレンダーUI
- **週表示形式**: react-big-calendarまたはカスタム実装
- **ドラッグ&ドロップ**: react-beautiful-dndでGoogleカレンダー風の操作性
- **2段階選択**: プロジェクト→タスク選択 + 独立した分類選択

### 集計・レポート機能
- **期間指定**: 今月・先月・カスタム期間対応
- **集計軸**: プロジェクト別・分類別・ユーザー別・クロス集計
- **複数選択**: プロジェクトと分類の複数選択によるフィルタリング

## API設計

### RESTful エンドポイント
```
GET    /api/reports/projects          # プロジェクト別集計
GET    /api/reports/categories        # 分類別集計
GET    /api/reports/users             # ユーザー別集計
GET    /api/reports/project-category  # クロス集計
```

## データベース設計

### 主要テーブル
- `users`: ユーザー管理（将来のログイン機能を想定）
- `projects`: プロジェクト管理（ユーザー単位）
- `categories`: 分類管理（プロジェクト横断、ユーザー単位）
- `tasks`: タスク管理（プロジェクト配下）
- `time_entries`: 工数エントリ（task_id + category_id + 時間情報）

### 重要な制約
- 15分刻み制約: `EXTRACT(minute FROM start_time) % 15 = 0`
- 時間重複防止: `idx_time_entries_user_time_unique`インデックス
- 論理削除: `deleted_at`カラムでデータ保持

## TDD開発フロー
t-wadaのTDD準拠

### サイクル
1. **RED**: 失敗するテストを先に作成
2. **GREEN**: 最小限の実装でテストを通す  
3. **REFACTOR**: コードを整理・改善

### テスト戦略
- **Unit Tests**: Domain層・Application層の単体テスト
- **Integration Tests**: API・データベース連携テスト
- **E2E Tests**: フロントエンド・バックエンド結合テスト

## 設計原則

### Clean Architecture適用
- **外部依存の注入**: repositoryパターンでデータアクセス層を抽象化
- **ビジネスロジックの独立性**: Domain層にビジネスルールを集約
- **テスタビリティ**: 各層を独立してテスト可能な設計

### パフォーマンス考慮
- **React最適化**: React.memo、useMemo、useCallbackの適切な活用
- **データベース最適化**: 適切なインデックス設計とクエリ最適化
- **不要な再レンダリング防止**: コンポーネントの適切な分割

## 将来拡張への配慮

- **ログイン機能**: Row Level Security (RLS)で認証基盤を準備
- **権限管理**: Role-Basedアクセス制御の実装準備
- **メタデータ拡張**: JSONBカラムでの柔軟な拡張対応

## 実装済み機能

### 完了済み（✅）
- **データベース設計**: Supabase + Prisma ORM完全セットアップ
- **Clean Architectureの基盤**: Domain、Application、Infrastructure、Presentation層の実装
- **基本CRUD操作**: User, Project, Category, Task, TimeEntry の完全なAPI実装
- **カレンダーUI**: react-big-calendarベースの直感的な工数入力インターフェース
- **ドラッグ&ドロップ**: 15分刻み制約付きの時間調整機能
- **レポート機能**: プロジェクト別・分類別・日別・詳細レポートの実装
- **ユーザー選択**: 動的ユーザー選択によるマルチユーザー対応
- **React Router**: SPA対応の完全なルーティング機能

### 次期実装予定TODOリスト（優先度順）

#### Phase 0: 基本機能の完成 ⚡ [最優先]
1. **プロジェクト・タスク・分類作成機能** [最高優先度]
   - フロントエンドでの新規作成フォーム実装
   - モーダルダイアログによるUX向上
   - バリデーション機能（重複チェック・必須項目）
   - カラーピッカー機能（プロジェクト・分類の色設定）

2. **ユーザー作成機能** [最高優先度]
   - 管理者向けユーザー作成機能
   - ユーザー情報編集機能
   - ユーザー一覧表示とフィルタリング
   - アクティブ/非アクティブ状態管理

3. **リストビュー機能** [最高優先度]
   - プロジェクト・タスク・分類の一覧表示
   - 検索・ソート・フィルタリング機能
   - インライン編集機能
   - 論理削除/復元機能

#### Phase 1: セキュリティ・認証基盤 🔐
1. **ユーザー認証機能の実装** [高優先度]
   - Supabase Authを使用したログイン/サインアップ機能
   - JWTトークンベースの認証システム
   - パスワードリセット機能

2. **権限管理とRLS（Row Level Security）の実装** [高優先度]  
   - Supabase RLS有効化
   - ユーザー単位のデータアクセス制御
   - 管理者権限の階層設計

#### Phase 2: データ管理・分析機能 📊
3. **工数データのエクスポート機能** [中優先度]
   - CSV/Excel/JSON形式での一括エクスポート
   - 期間・プロジェクト・ユーザー指定でのフィルタリング
   - 集計データの可視化（チャート機能）

4. **通知機能（工数入力リマインダー等）** [中優先度]
   - ブラウザ通知APIを使用したリマインダー機能  
   - 日次/週次レポートのメール送信（Supabase Edge Functions使用）
   - 工数未入力日の検出とアラート

#### Phase 3: UI/UX改善 📱
5. **モバイル対応（レスポンシブデザイン）** [中優先度]
   - Bootstrap 5によるモバイル最適化
   - タッチデバイス向けのドラッグ&ドロップ操作改善
   - PWA（Progressive Web App）対応検討

6. **パフォーマンス最適化（React.memo、useMemo等）** [低優先度]
   - レンダリング最適化による高速化
   - 大量データ対応のための仮想スクロール実装
   - バンドルサイズ最適化とCode Splitting

## 技術的な実装ガイドライン

### 認証実装時の注意点
- **Supabase Auth**: `@supabase/auth-helpers-react`を使用
- **Protected Routes**: HOCでの認証チェック実装
- **Token管理**: ローカルストレージではなくhttpOnlyCookieを推奨

### RLS実装パターン
```sql
-- 例：ユーザー単位のプロジェクトアクセス制御
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);
```

### Phase 0実装時の技術指針
- **モーダルダイアログ**: React Bootstrap Modal使用
- **フォームバリデーション**: `react-hook-form` + `yup`スキーマ
- **カラーピッカー**: `react-color`ライブラリ
- **データテーブル**: React Bootstrap Table + カスタムソート/フィルタ
- **インライン編集**: `contentEditable` + `onBlur`イベント

### エクスポート機能の技術選択肢
- **CSVエクスポート**: `react-csv`ライブラリ
- **Excelエクスポート**: `xlsx`ライブラリ  
- **チャート**: `Chart.js` or `Recharts`
- **大量データ処理**: Web Worker活用

### 通知機能の実装方針
- **ブラウザ通知**: Notification API + Service Worker
- **メール通知**: Supabase Edge Functions + Resend API
- **リマインダー**: `cron`パターンでの定期実行

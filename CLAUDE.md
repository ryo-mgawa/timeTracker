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

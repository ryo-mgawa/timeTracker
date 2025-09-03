# データベースセットアップ手順

## 実行順序

以下の順番でSupabaseのSQL Editorにファイルの内容をコピー＆実行してください：

### 1. テーブル作成
```
01_create_tables.sql
```
- 基本テーブル（users, projects, categories, tasks, time_entries）
- 基本制約（15分刻み、時間順序、24時間制限）

### 2. インデックス作成
```
02_create_indexes.sql
```
- パフォーマンス最適化用インデックス
- 重複防止用ユニークインデックス
- 論理削除対応インデックス

### 3. ビュー作成
```
03_create_views.sql
```
- プロジェクト別集計ビュー
- 分類別集計ビュー
- ユーザー別集計ビュー
- クロス集計ビュー

### 4. トリガー・関数作成
```
04_create_triggers.sql
```
- updated_at自動更新機能
- 時間重複チェック機能

### 5. セキュリティ設定
```
05_create_security.sql
```
- Row Level Security設定
- 将来のログイン機能対応

### 6. 拡張機能（オプション）
```
06_create_extensions.sql
```
- メタデータ格納用JSONBカラム
- 将来の監査ログ準備

## 注意事項

- **実行環境**: Supabase Dashboard の SQL Editor を使用
- **権限**: テーブル作成権限が必要
- **順序**: 必ず上記の順番で実行してください
- **エラー時**: 前のステップが完了してから次へ進んでください

## 確認方法

各ステップ実行後、以下で確認できます：

```sql
-- テーブル一覧確認
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- インデックス確認
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public';

-- ビュー確認
SELECT table_name FROM information_schema.views 
WHERE table_schema = 'public';
```

## トラブルシューティング

### よくあるエラー
- **権限エラー**: 管理者権限でログインしているか確認
- **依存関係エラー**: 実行順序を守っているか確認
- **重複エラー**: 既存のテーブル・インデックスを削除してから再実行

### 開発時の注意
- RLSが有効になっているため、認証なしでのデータアクセスが制限される場合があります
- 開発中はRLSを一時無効にするか、テスト用ポリシーを作成してください
-- ==============================================
-- セキュリティ設定スクリプト (Row Level Security)
-- ==============================================

-- Row Level Security を有効化
-- ユーザーは自分のデータのみアクセス可能
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- RLSポリシー（将来のログイン機能対応）
-- 注意：auth.uid()はSupabase認証が設定されてから有効になります

-- プロジェクトテーブルのポリシー
CREATE POLICY user_projects_policy ON projects
    FOR ALL USING (user_id = auth.uid());

-- 分類テーブルのポリシー  
CREATE POLICY user_categories_policy ON categories
    FOR ALL USING (user_id = auth.uid());

-- タスクテーブルのポリシー
CREATE POLICY user_tasks_policy ON tasks
    FOR ALL USING (user_id = auth.uid());

-- 工数エントリテーブルのポリシー
CREATE POLICY user_time_entries_policy ON time_entries
    FOR ALL USING (user_id = auth.uid());

-- 注意事項：
-- 現在はSupabase認証が未設定のため、これらのポリシーは無効になる可能性があります。
-- 開発中はRLSを一時的に無効にするか、テスト用のポリシーを作成してください。
-- 本格運用時にはauth.uid()による適切なユーザー認証を実装してください。
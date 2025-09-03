-- ==============================================
-- インデックス作成スクリプト
-- ==============================================

-- ユーザー別の工数検索用（日付範囲クエリに最適化）
CREATE INDEX idx_time_entries_user_date ON time_entries(user_id, date);

-- 時間の重複チェック用（同時間帯の重複防止）
CREATE UNIQUE INDEX idx_time_entries_user_time_unique ON time_entries(
    user_id, start_time, end_time
) WHERE deleted_at IS NULL;

-- プロジェクト・分類での集計用
CREATE INDEX idx_time_entries_task ON time_entries(task_id);
CREATE INDEX idx_time_entries_category ON time_entries(category_id);
CREATE INDEX idx_time_entries_task_category ON time_entries(task_id, category_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);

-- クロス集計用（プロジェクト×分類）
CREATE INDEX idx_time_entries_project_category ON time_entries(task_id, category_id, date);

-- 論理削除対応
CREATE INDEX idx_users_active ON users(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_active ON projects(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_categories_active ON categories(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_active ON tasks(user_id) WHERE deleted_at IS NULL;

-- プロジェクト名の重複防止（同一ユーザー内）
CREATE UNIQUE INDEX idx_projects_user_name_unique ON projects(user_id, name) 
WHERE deleted_at IS NULL;

-- 分類名の重複防止（同一ユーザー内）
CREATE UNIQUE INDEX idx_categories_user_name_unique ON categories(user_id, name) 
WHERE deleted_at IS NULL;

-- タスク名の重複防止（同一プロジェクト内）
CREATE UNIQUE INDEX idx_tasks_project_name_unique ON tasks(project_id, name) 
WHERE deleted_at IS NULL;

-- パフォーマンス最適化用インデックス
-- よく使用される集計クエリの最適化
CREATE INDEX idx_time_entries_aggregate ON time_entries(
    user_id, date, task_id, category_id
) INCLUDE (start_time, end_time);

-- 注意：月次集計は既存のidx_time_entries_user_dateインデックスを利用
-- DATE_TRUNC関数を使った関数型インデックスはPostgreSQLでは制限があるため
-- アプリケーション側で適切な日付範囲クエリを使用してください
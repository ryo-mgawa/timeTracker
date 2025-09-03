-- レポート・集計用のビュー作成SQL

-- 1. 工数詳細ビュー (WorkHoursDetailView)
-- TimeEntry、Task、Project、Categoryを結合した詳細ビュー
CREATE OR REPLACE VIEW work_hours_detail AS
SELECT 
    te.id as time_entry_id,
    te.user_id,
    te.date as work_date,
    te.start_time,
    te.end_time,
    EXTRACT(EPOCH FROM (te.end_time - te.start_time)) / 3600 as work_hours,
    te.memo,
    -- タスク情報
    t.id as task_id,
    t.name as task_name,
    t.description as task_description,
    -- プロジェクト情報
    p.id as project_id,
    p.name as project_name,
    p.color as project_color,
    -- 分類情報
    c.id as category_id,
    c.name as category_name,
    c.color as category_color,
    -- ユーザー情報
    u.name as user_name,
    u.email as user_email
FROM time_entries te
JOIN tasks t ON te.task_id = t.id
JOIN projects p ON t.project_id = p.id
JOIN categories c ON te.category_id = c.id
JOIN users u ON te.user_id = u.id
WHERE te.deleted_at IS NULL
    AND t.deleted_at IS NULL
    AND p.deleted_at IS NULL
    AND c.deleted_at IS NULL;

-- 2. プロジェクト別集計ビュー
CREATE OR REPLACE VIEW project_work_summary AS
SELECT 
    p.id as project_id,
    p.name as project_name,
    p.color as project_color,
    p.user_id,
    COUNT(te.id) as total_entries,
    ROUND(SUM(EXTRACT(EPOCH FROM (te.end_time - te.start_time)) / 3600)::numeric, 2) as total_hours,
    MIN(te.date) as first_work_date,
    MAX(te.date) as last_work_date
FROM projects p
JOIN tasks t ON p.id = t.project_id
JOIN time_entries te ON t.id = te.task_id
WHERE p.deleted_at IS NULL
    AND t.deleted_at IS NULL
    AND te.deleted_at IS NULL
GROUP BY p.id, p.name, p.color, p.user_id;

-- 3. 分類別集計ビュー
CREATE OR REPLACE VIEW category_work_summary AS
SELECT 
    c.id as category_id,
    c.name as category_name,
    c.color as category_color,
    c.user_id,
    COUNT(te.id) as total_entries,
    ROUND(SUM(EXTRACT(EPOCH FROM (te.end_time - te.start_time)) / 3600)::numeric, 2) as total_hours,
    MIN(te.date) as first_work_date,
    MAX(te.date) as last_work_date
FROM categories c
JOIN time_entries te ON c.id = te.category_id
WHERE c.deleted_at IS NULL
    AND te.deleted_at IS NULL
GROUP BY c.id, c.name, c.color, c.user_id;

-- 4. 日別工数集計ビュー
CREATE OR REPLACE VIEW daily_work_summary AS
SELECT 
    te.user_id,
    te.date as work_date,
    COUNT(te.id) as total_entries,
    ROUND(SUM(EXTRACT(EPOCH FROM (te.end_time - te.start_time)) / 3600)::numeric, 2) as total_hours,
    COUNT(DISTINCT p.id) as projects_count,
    COUNT(DISTINCT c.id) as categories_count
FROM time_entries te
JOIN tasks t ON te.task_id = t.id
JOIN projects p ON t.project_id = p.id
JOIN categories c ON te.category_id = c.id
WHERE te.deleted_at IS NULL
    AND t.deleted_at IS NULL
    AND p.deleted_at IS NULL
    AND c.deleted_at IS NULL
GROUP BY te.user_id, te.date;

-- 5. 月別工数集計ビュー
CREATE OR REPLACE VIEW monthly_work_summary AS
SELECT 
    te.user_id,
    DATE_TRUNC('month', te.date) as work_month,
    COUNT(te.id) as total_entries,
    ROUND(SUM(EXTRACT(EPOCH FROM (te.end_time - te.start_time)) / 3600)::numeric, 2) as total_hours,
    COUNT(DISTINCT p.id) as projects_count,
    COUNT(DISTINCT c.id) as categories_count,
    COUNT(DISTINCT te.date) as work_days_count
FROM time_entries te
JOIN tasks t ON te.task_id = t.id
JOIN projects p ON t.project_id = p.id
JOIN categories c ON te.category_id = c.id
WHERE te.deleted_at IS NULL
    AND t.deleted_at IS NULL
    AND p.deleted_at IS NULL
    AND c.deleted_at IS NULL
GROUP BY te.user_id, DATE_TRUNC('month', te.date);

-- インデックス作成（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_time_entries_user_date ON time_entries(user_id, date) WHERE deleted_at IS NULL;
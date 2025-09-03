-- ==============================================
-- ビュー作成スクリプト
-- ==============================================

-- 1. 工数集計ビュー（プロジェクトごと）
CREATE VIEW v_project_summary AS
SELECT 
    u.name as user_name,
    p.name as project_name,
    DATE_TRUNC('month', te.date) as month,
    SUM(EXTRACT(epoch FROM (te.end_time - te.start_time))/3600) as total_hours,
    COUNT(te.id) as entry_count
FROM time_entries te
JOIN tasks t ON te.task_id = t.id AND t.deleted_at IS NULL
JOIN projects p ON t.project_id = p.id AND p.deleted_at IS NULL
JOIN users u ON te.user_id = u.id AND u.deleted_at IS NULL
GROUP BY u.name, p.name, DATE_TRUNC('month', te.date);

-- 2. 工数集計ビュー（分類ごと）
CREATE VIEW v_category_summary AS
SELECT 
    u.name as user_name,
    c.name as category_name,
    DATE_TRUNC('month', te.date) as month,
    SUM(EXTRACT(epoch FROM (te.end_time - te.start_time))/3600) as total_hours,
    COUNT(te.id) as entry_count
FROM time_entries te
JOIN categories c ON te.category_id = c.id AND c.deleted_at IS NULL
JOIN users u ON te.user_id = u.id AND u.deleted_at IS NULL
GROUP BY u.name, c.name, DATE_TRUNC('month', te.date);

-- 3. 工数集計ビュー（ユーザーごと）
CREATE VIEW v_user_summary AS
SELECT 
    u.name as user_name,
    DATE_TRUNC('month', te.date) as month,
    SUM(EXTRACT(epoch FROM (te.end_time - te.start_time))/3600) as total_hours,
    COUNT(te.id) as entry_count,
    COUNT(DISTINCT t.project_id) as project_count,
    COUNT(DISTINCT te.category_id) as category_count
FROM time_entries te
JOIN tasks t ON te.task_id = t.id AND t.deleted_at IS NULL
JOIN projects p ON t.project_id = p.id AND p.deleted_at IS NULL
JOIN categories c ON te.category_id = c.id AND c.deleted_at IS NULL
JOIN users u ON te.user_id = u.id AND u.deleted_at IS NULL
GROUP BY u.name, DATE_TRUNC('month', te.date);

-- 4. クロス集計ビュー（プロジェクト×分類）
CREATE VIEW v_project_category_summary AS
SELECT 
    u.name as user_name,
    p.name as project_name,
    c.name as category_name,
    DATE_TRUNC('month', te.date) as month,
    SUM(EXTRACT(epoch FROM (te.end_time - te.start_time))/3600) as total_hours,
    COUNT(te.id) as entry_count
FROM time_entries te
JOIN tasks t ON te.task_id = t.id AND t.deleted_at IS NULL
JOIN projects p ON t.project_id = p.id AND p.deleted_at IS NULL
JOIN categories c ON te.category_id = c.id AND c.deleted_at IS NULL
JOIN users u ON te.user_id = u.id AND u.deleted_at IS NULL
GROUP BY u.name, p.name, c.name, DATE_TRUNC('month', te.date);
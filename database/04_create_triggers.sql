-- ==============================================
-- トリガー・関数作成スクリプト
-- ==============================================

-- 1. 更新日時自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 各テーブルに適用
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. 時間重複チェック関数
CREATE OR REPLACE FUNCTION check_time_overlap()
RETURNS TRIGGER AS $$
BEGIN
    -- 同じユーザーの同じ時間帯に他のエントリがないかチェック
    IF EXISTS (
        SELECT 1 FROM time_entries
        WHERE user_id = NEW.user_id
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND (
            (NEW.start_time >= start_time AND NEW.start_time < end_time) OR
            (NEW.end_time > start_time AND NEW.end_time <= end_time) OR
            (NEW.start_time <= start_time AND NEW.end_time >= end_time)
        )
    ) THEN
        RAISE EXCEPTION '指定された時間帯には既に別の工数が登録されています';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER check_time_overlap_trigger
    BEFORE INSERT OR UPDATE ON time_entries
    FOR EACH ROW EXECUTE FUNCTION check_time_overlap();
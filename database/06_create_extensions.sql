-- ==============================================
-- 拡張性対応スクリプト
-- ==============================================

-- 1. 将来の機能拡張対応
-- 拡張可能なメタデータ格納用のJSONBカラムを追加
ALTER TABLE projects ADD COLUMN metadata JSONB DEFAULT '{}';
ALTER TABLE categories ADD COLUMN metadata JSONB DEFAULT '{}';
ALTER TABLE tasks ADD COLUMN metadata JSONB DEFAULT '{}';

-- JSONBインデックス（必要に応じて有効化）
-- パフォーマンスが必要になった際にコメントアウトを解除してください
-- CREATE INDEX idx_projects_metadata ON projects USING gin(metadata);
-- CREATE INDEX idx_categories_metadata ON categories USING gin(metadata);  
-- CREATE INDEX idx_tasks_metadata ON tasks USING gin(metadata);

-- 2. ログ・監査対応（将来対応）
-- 監査ログテーブル（必要になったら有効化）
/*
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    operation VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    old_data JSONB,
    new_data JSONB,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 監査ログ用のインデックス
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
*/

-- 3. パフォーマンス最適化（将来的に検討）
-- 大量データ対応時のパーティショニング例
/*
-- 月単位でのパーティショニング（time_entriesテーブル）
CREATE TABLE time_entries_2025_01 PARTITION OF time_entries
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE time_entries_2025_02 PARTITION OF time_entries
FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
-- 以下、必要に応じて月別パーティションを追加
*/

-- 注意事項：
-- 1. メタデータ機能は初期段階では使用しません
-- 2. 監査ログ機能は要件に応じて後日実装予定
-- 3. パーティショニングは大量データになった際に検討
-- 4. 拡張機能は段階的に実装していきます
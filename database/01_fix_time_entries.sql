-- ==============================================
-- time_entriesテーブルの修正
-- ==============================================

-- deleted_atカラムを追加
ALTER TABLE time_entries ADD COLUMN deleted_at TIMESTAMPTZ;
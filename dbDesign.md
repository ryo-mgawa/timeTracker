# データベース設計書

## 1. データベース概要
- **データベース管理システム**: Supabase (PostgreSQL)
- **文字エンコーディング**: UTF8
- **タイムゾーン**: Asia/Tokyo

## 2. テーブル設計

### 2.1 users（ユーザーテーブル）
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
```

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|----------|------|------------|------|
| id | UUID | NOT NULL | gen_random_uuid() | ユーザーID（主キー） |
| name | VARCHAR(100) | NOT NULL | - | ユーザー名 |
| email | VARCHAR(255) | NULL | - | メールアドレス（将来のログイン機能用） |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | 更新日時 |
| deleted_at | TIMESTAMPTZ | NULL | - | 削除日時（論理削除） |

### 2.2 projects（プロジェクトテーブル）
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3498db', -- カレンダー表示用の色
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
```

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|----------|------|------------|------|
| id | UUID | NOT NULL | gen_random_uuid() | プロジェクトID（主キー） |
| name | VARCHAR(200) | NOT NULL | - | プロジェクト名 |
| description | TEXT | NULL | - | プロジェクト説明 |
| color | VARCHAR(7) | NULL | #3498db | 表示色（HEXカラーコード） |
| user_id | UUID | NOT NULL | - | ユーザーID（外部キー） |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | 更新日時 |
| deleted_at | TIMESTAMPTZ | NULL | - | 削除日時（論理削除） |

### 2.3 categories（分類テーブル）
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#e74c3c', -- カレンダー表示用の色
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
```

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|----------|------|------------|------|
| id | UUID | NOT NULL | gen_random_uuid() | 分類ID（主キー） |
| name | VARCHAR(100) | NOT NULL | - | 分類名 |
| description | TEXT | NULL | - | 分類説明 |
| color | VARCHAR(7) | NULL | #e74c3c | 表示色（HEXカラーコード） |
| user_id | UUID | NOT NULL | - | ユーザーID（外部キー） |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | 更新日時 |
| deleted_at | TIMESTAMPTZ | NULL | - | 削除日時（論理削除） |

### 2.4 tasks（タスクテーブル）
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
```

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|----------|------|------------|------|
| id | UUID | NOT NULL | gen_random_uuid() | タスクID（主キー） |
| name | VARCHAR(200) | NOT NULL | - | タスク名 |
| description | TEXT | NULL | - | タスク説明 |
| project_id | UUID | NOT NULL | - | プロジェクトID（外部キー） |
| user_id | UUID | NOT NULL | - | ユーザーID（外部キー） |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | 更新日時 |
| deleted_at | TIMESTAMPTZ | NULL | - | 削除日時（論理削除） |

**注意**: タスクは特定のプロジェクトに属し、分類は工数入力時に独立して選択する設計。

### 2.5 time_entries（工数エントリテーブル）
```sql
CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    date DATE NOT NULL, -- インデックス効率化のため日付を分離
    memo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- 制約：終了時間は開始時間より後
    CONSTRAINT check_time_order CHECK (end_time > start_time),
    -- 制約：15分刻みであること
    CONSTRAINT check_15min_interval CHECK (
        EXTRACT(minute FROM start_time) % 15 = 0 AND
        EXTRACT(minute FROM end_time) % 15 = 0
    )
);
```

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|----------|------|------------|------|
| id | UUID | NOT NULL | gen_random_uuid() | 工数エントリID（主キー） |
| task_id | UUID | NOT NULL | - | タスクID（外部キー） |
| category_id | UUID | NOT NULL | - | 分類ID（外部キー）※工数入力時に独立選択 |
| user_id | UUID | NOT NULL | - | ユーザーID（外部キー） |
| start_time | TIMESTAMPTZ | NOT NULL | - | 開始時間 |
| end_time | TIMESTAMPTZ | NOT NULL | - | 終了時間 |
| date | DATE | NOT NULL | - | 作業日（検索効率化） |
| memo | TEXT | NULL | - | メモ |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | 更新日時 |

## 3. インデックス設計

### 3.1 主要インデックス
```sql
-- ユーザー別の工数検索用
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
```

## 4. ビュー設計

### 4.1 工数集計ビュー（プロジェクトごと）
```sql
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
```

### 4.2 工数集計ビュー（分類ごと）
```sql
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
```

### 4.3 工数集計ビュー（ユーザーごと）
```sql
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
```

### 4.4 クロス集計ビュー（プロジェクト×分類）
```sql
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
```

## 5. トリガー・関数

### 5.1 更新日時自動更新トリガー
```sql
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
```

### 5.2 時間重複チェック関数
```sql
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
```

## 6. データ保持ポリシー
- **論理削除**: プロジェクト、分類、タスクは論理削除（deleted_at）で管理
- **物理削除**: ユーザーが完全削除された場合のみ、関連データも物理削除
- **データ整合性**: 削除されたプロジェクト・分類でも過去の工数データは保持
- **関係性の保持**: 
  - タスク削除時：過去の工数データは保持（プロジェクト情報はtasks経由で参照）
  - 分類削除時：過去の工数データは保持（分類情報は直接参照）
  - プロジェクトと分類の独立性を維持
- **バックアップ**: Supabaseの自動バックアップ機能を利用

## 7. セキュリティ設計

### 7.1 Row Level Security (RLS)
```sql
-- ユーザーは自分のデータのみアクセス可能
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- RLSポリシー例（将来のログイン機能対応）
CREATE POLICY user_projects_policy ON projects
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY user_categories_policy ON categories
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY user_tasks_policy ON tasks
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY user_time_entries_policy ON time_entries
    FOR ALL USING (user_id = auth.uid());
```

### 7.2 データバリデーション
```sql
-- プロジェクト名の重複防止（同一ユーザー内）
CREATE UNIQUE INDEX idx_projects_user_name_unique ON projects(user_id, name) 
WHERE deleted_at IS NULL;

-- 分類名の重複防止（同一ユーザー内）
CREATE UNIQUE INDEX idx_categories_user_name_unique ON categories(user_id, name) 
WHERE deleted_at IS NULL;

-- タスク名の重複防止（同一プロジェクト内）
CREATE UNIQUE INDEX idx_tasks_project_name_unique ON tasks(project_id, name) 
WHERE deleted_at IS NULL;

-- 工数時間の妥当性チェック
ALTER TABLE time_entries ADD CONSTRAINT check_reasonable_duration 
CHECK (EXTRACT(epoch FROM (end_time - start_time)) <= 86400); -- 24時間以内
```

## 8. パフォーマンス最適化

### 8.1 パーティショニング検討
```sql
-- 大量データ対応（将来的に検討）
-- 月単位でのパーティショニング
CREATE TABLE time_entries_2025_01 PARTITION OF time_entries
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

### 8.2 クエリ最適化
```sql
-- よく使用される集計クエリの最適化
CREATE INDEX idx_time_entries_aggregate ON time_entries(
    user_id, date, task_id, category_id
) INCLUDE (start_time, end_time);

-- 月次集計用の部分インデックス
CREATE INDEX idx_time_entries_monthly ON time_entries(
    user_id, DATE_TRUNC('month', date)
) WHERE deleted_at IS NULL;
```

### 8.3 統計情報更新
```sql
-- 定期的な統計情報更新（Supabaseで自動実行）
ANALYZE time_entries;
ANALYZE tasks;
ANALYZE projects;
ANALYZE categories;
```

## 9. 運用・監視

### 9.1 監視すべきメトリクス
- **クエリパフォーマンス**: 応答時間の監視
- **データ増加量**: time_entriesテーブルの成長率
- **インデックス使用率**: 未使用インデックスの特定
- **デッドロック発生**: 同時アクセス時の問題検知

### 9.2 定期メンテナンス
```sql
-- 定期的なバキューム（Supabaseで自動実行）
VACUUM ANALYZE time_entries;

-- 不要データの物理削除（年次実行想定）
DELETE FROM time_entries WHERE deleted_at < NOW() - INTERVAL '7 years';
```

### 9.3 データ移行・バックアップ戦略
- **差分バックアップ**: 日次で変更データのみ
- **フルバックアップ**: 週次での完全バックアップ
- **災害復旧**: 復旧手順の文書化
- **テストデータ**: 本番データの一部を開発環境に複製

## 10. 拡張性考慮

### 10.1 将来の機能拡張対応
```sql
-- 拡張可能なメタデータ格納
ALTER TABLE projects ADD COLUMN metadata JSONB DEFAULT '{}';
ALTER TABLE categories ADD COLUMN metadata JSONB DEFAULT '{}';
ALTER TABLE tasks ADD COLUMN metadata JSONB DEFAULT '{}';

-- JSONBインデックス（必要に応じて）
CREATE INDEX idx_projects_metadata ON projects USING gin(metadata);
```

### 10.2 ログ・監査対応
```sql
-- 監査ログテーブル（将来対応）
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    operation VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    old_data JSONB,
    new_data JSONB,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```
import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from 'react-bootstrap';
import { Category } from '../types';
import { categoryService } from '../services/categoryService';
import AdminList from './AdminList';

// プロパティ型定義
interface CategoryListProps {
  readonly userId: string;
  readonly onEdit?: (category: Category) => void;
  readonly refreshTrigger?: number;
}

const CategoryList: React.FC<CategoryListProps> = ({
  userId,
  onEdit,
  refreshTrigger = 0
}) => {
  const [categories, setCategories] = useState<readonly Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // 分類一覧取得
  const fetchCategories = useCallback(async (): Promise<void> => {
    if (!userId) {
      setCategories([]);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const categoriesData = await categoryService.getCategoriesByUserId(userId);
      setCategories(categoriesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '分類一覧の取得に失敗しました';
      setError(errorMessage);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 初期データ取得とリフレッシュ対応
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories, refreshTrigger]);

  // 分類削除
  const handleDelete = useCallback(async (category: Category): Promise<void> => {
    try {
      setLoading(true);
      await categoryService.deleteCategory(category.userId, category.id);
      
      // 一覧を更新
      await fetchCategories();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '分類の削除に失敗しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  // 編集ハンドラー
  const handleEdit = useCallback((category: Category): void => {
    onEdit?.(category);
  }, [onEdit]);

  // カラム定義
  const columns = [
    {
      key: 'name' as keyof Category,
      label: '分類名',
      sortable: true,
      searchable: true,
      render: (category: Category) => (
        <div className="d-flex align-items-center">
          <Badge 
            style={{ 
              backgroundColor: category.color,
              color: category.color === '#f8f9fa' || category.color === '#ced4da' || category.color === '#adb5bd' ? '#000' : '#fff'
            }}
            className="me-2"
          >
            {category.name}
          </Badge>
        </div>
      )
    },
    {
      key: 'description' as keyof Category,
      label: '説明',
      render: (category: Category) => (
        <span className="text-muted">
          {category.description || '説明なし'}
        </span>
      )
    },
    {
      key: 'color' as keyof Category,
      label: 'カラー',
      render: (category: Category) => (
        <div className="d-flex align-items-center">
          <div
            className="rounded me-2"
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: category.color,
              border: '1px solid #dee2e6'
            }}
          />
          <code className="text-muted small">{category.color}</code>
        </div>
      )
    },
    {
      key: 'createdAt' as keyof Category,
      label: '作成日',
      sortable: true,
      render: (category: Category) => (
        <span className="text-muted small">
          {category.createdAt.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </span>
      )
    },
    {
      key: 'actions' as const,
      label: 'アクション'
    }
  ];

  return (
    <AdminList
      title="分類一覧"
      items={categories}
      columns={columns}
      loading={loading}
      error={error}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onRefresh={fetchCategories}
      searchPlaceholder="分類名で検索..."
      emptyMessage={
        userId 
          ? "分類がありません。新規作成してください。"
          : "ユーザーを選択してください。"
      }
    />
  );
};

export default CategoryList;
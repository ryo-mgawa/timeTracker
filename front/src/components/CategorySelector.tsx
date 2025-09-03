import React, { useState, useEffect } from 'react';
import { ListGroup, Spinner, Alert } from 'react-bootstrap';
import { Category, User } from 'types';
import { categoryService } from 'services/categoryService';

interface CategorySelectorProps {
  readonly user: User;
  readonly selectedCategory: Category | null;
  readonly onCategorySelect: (category: Category | null) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  user,
  selectedCategory,
  onCategorySelect
}) => {
  const [categories, setCategories] = useState<readonly Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // 分類一覧を取得
  useEffect(() => {
    const fetchCategories = async (): Promise<void> => {
      // アーリーリターン - ユーザーがない場合
      if (!user?.id) {
        setCategories([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        const fetchedCategories = await categoryService.getCategoriesByUserId(user.id);
        setCategories(fetchedCategories);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '分類一覧の取得に失敗しました';
        setError(errorMessage);
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [user?.id]);

  // 分類選択ハンドラー
  const handleCategorySelect = (category: Category): void => {
    // 同じ分類をクリックした場合は選択解除
    if (selectedCategory?.id === category.id) {
      onCategorySelect(null);
    } else {
      onCategorySelect(category);
    }
  };

  // ローディング表示
  if (loading) {
    return (
      <div className="text-center p-3">
        <Spinner animation="border" size="sm" className="me-2" />
        <small className="text-muted">分類読み込み中...</small>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <Alert variant="danger" className="p-2 small">
        {error}
      </Alert>
    );
  }

  // 分類が0件の場合
  if (categories.length === 0) {
    return (
      <div className="text-center p-3">
        <small className="text-muted">利用可能な分類がありません</small>
      </div>
    );
  }

  return (
    <ListGroup variant="flush">
      {categories.map((category) => (
        <ListGroup.Item
          key={category.id}
          action
          active={selectedCategory?.id === category.id}
          onClick={() => handleCategorySelect(category)}
          className="d-flex justify-content-between align-items-center py-2 px-3"
        >
          <div className="d-flex align-items-center">
            <div
              className="rounded me-2"
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: category.color || '#28a745'
              }}
            />
            <div>
              <div className="fw-bold small">{category.name}</div>
              {category.description && (
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {category.description}
                </div>
              )}
            </div>
          </div>
          {selectedCategory?.id === category.id && (
            <small className="text-primary">✓</small>
          )}
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default CategorySelector;
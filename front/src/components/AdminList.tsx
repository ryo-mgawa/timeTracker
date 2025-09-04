import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Form, InputGroup, Alert, Spinner, Badge } from 'react-bootstrap';

// 汎用的なリストアイテム型
interface ListItem {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// カラム定義型
interface ColumnConfig<T extends ListItem> {
  readonly key: keyof T | 'actions';
  readonly label: string;
  readonly render?: (item: T) => React.ReactNode;
  readonly sortable?: boolean;
  readonly searchable?: boolean;
}

// プロパティ型定義
interface AdminListProps<T extends ListItem> {
  readonly title: string;
  readonly items: readonly T[];
  readonly columns: readonly ColumnConfig<T>[];
  readonly loading?: boolean;
  readonly error?: string;
  readonly onEdit?: (item: T) => void;
  readonly onDelete?: (item: T) => void;
  readonly onItemClick?: (item: T) => void;
  readonly onRefresh?: () => void;
  readonly searchPlaceholder?: string;
  readonly emptyMessage?: string;
}

function AdminList<T extends ListItem>({
  title,
  items,
  columns,
  loading = false,
  error = '',
  onEdit,
  onDelete,
  onItemClick,
  onRefresh,
  searchPlaceholder = '検索...',
  emptyMessage = 'データが見つかりません。'
}: AdminListProps<T>): React.ReactElement {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<keyof T | ''>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // 検索フィルタリング
  const filteredItems = useCallback((): readonly T[] => {
    if (!searchTerm.trim()) return items;

    const searchLower = searchTerm.toLowerCase();
    return items.filter(item => {
      // 名前と説明で検索
      const nameMatch = item.name?.toLowerCase().includes(searchLower);
      const descriptionMatch = item.description?.toLowerCase().includes(searchLower);
      return nameMatch || descriptionMatch;
    });
  }, [items, searchTerm]);

  // ソート処理
  const sortedItems = useCallback((): readonly T[] => {
    const filtered = filteredItems();
    if (!sortColumn) return filtered;

    return [...filtered].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      let comparison = 0;
      if (aVal && bVal) {
        if (aVal instanceof Date && bVal instanceof Date) {
          comparison = aVal.getTime() - bVal.getTime();
        } else {
          comparison = String(aVal).localeCompare(String(bVal));
        }
      }

      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [filteredItems, sortColumn, sortDirection]);

  // ソートハンドラー
  const handleSort = (column: keyof T): void => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // 検索入力ハンドラー
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(event.target.value);
  };

  // リフレッシュハンドラー
  const handleRefresh = (): void => {
    onRefresh?.();
  };

  // 編集ハンドラー
  const handleEdit = (item: T): void => {
    onEdit?.(item);
  };

  // 削除ハンドラー
  const handleDelete = (item: T): void => {
    if (window.confirm(`「${item.name}」を削除しますか？`)) {
      onDelete?.(item);
    }
  };

  // 行クリックハンドラー
  const handleItemClick = (item: T): void => {
    onItemClick?.(item);
  };

  const displayItems = sortedItems();

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="fas fa-list me-2"></i>
          {title}
          <Badge bg="secondary" className="ms-2">
            {displayItems.length}
          </Badge>
        </h5>
        {onRefresh && (
          <Button variant="outline-secondary" size="sm" onClick={handleRefresh} disabled={loading}>
            <i className="fas fa-sync-alt me-1"></i>
            更新
          </Button>
        )}
      </Card.Header>

      <Card.Body>
        {/* 検索バー */}
        <div className="mb-3">
          <InputGroup>
            <InputGroup.Text>
              <i className="fas fa-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleSearchChange}
              disabled={loading}
            />
            {searchTerm && (
              <Button
                variant="outline-secondary"
                onClick={() => setSearchTerm('')}
                disabled={loading}
              >
                <i className="fas fa-times"></i>
              </Button>
            )}
          </InputGroup>
        </div>

        {/* エラー表示 */}
        {error && (
          <Alert variant="danger" className="mb-3">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {/* ローディング表示 */}
        {loading && (
          <div className="text-center py-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">読み込み中...</span>
            </Spinner>
            <div className="mt-2 text-muted">データを読み込み中...</div>
          </div>
        )}

        {/* テーブル表示 */}
        {!loading && (
          <>
            {displayItems.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="fas fa-inbox fa-3x mb-3"></i>
                <div>{emptyMessage}</div>
                {searchTerm && (
                  <div className="mt-2">
                    <Button variant="link" onClick={() => setSearchTerm('')}>
                      検索条件をクリア
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover>
                  <thead className="table-light">
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={String(column.key)}
                          style={{
                            cursor: column.sortable && column.key !== 'actions' ? 'pointer' : 'default'
                          }}
                          onClick={() => {
                            if (column.sortable && column.key !== 'actions') {
                              handleSort(column.key as keyof T);
                            }
                          }}
                        >
                          {column.label}
                          {column.sortable && column.key !== 'actions' && (
                            <i className={`fas ${
                              sortColumn === column.key 
                                ? `fa-sort-${sortDirection === 'asc' ? 'up' : 'down'} text-primary`
                                : 'fa-sort text-muted'
                            } ms-1`}></i>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayItems.map((item) => (
                      <tr 
                        key={item.id}
                        onClick={onItemClick ? () => handleItemClick(item) : undefined}
                        style={{ 
                          cursor: onItemClick ? 'pointer' : 'default' 
                        }}
                        className={onItemClick ? 'table-row-hover' : ''}
                      >
                        {columns.map((column) => (
                          <td key={String(column.key)}>
                            {column.key === 'actions' ? (
                              <div className="d-flex gap-2">
                                {onEdit && (
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => handleEdit(item)}
                                  >
                                    <i className="fas fa-edit"></i>
                                  </Button>
                                )}
                                {onDelete && (
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleDelete(item)}
                                  >
                                    <i className="fas fa-trash"></i>
                                  </Button>
                                )}
                              </div>
                            ) : column.render ? (
                              column.render(item)
                            ) : (
                              String(item[column.key as keyof T] || '')
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
}

export default AdminList;
import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from 'react-bootstrap';
import { User } from '../types';
import { userService } from '../services/userService';
import AdminList from './AdminList';

// プロパティ型定義
interface UserListProps {
  readonly onEdit?: (user: User) => void;
  readonly refreshTrigger?: number;
}

const UserList: React.FC<UserListProps> = ({
  onEdit,
  refreshTrigger = 0
}) => {
  const [users, setUsers] = useState<readonly User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // ユーザー一覧取得
  const fetchUsers = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      const usersData = await userService.getUsers();
      setUsers(usersData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ユーザー一覧の取得に失敗しました';
      setError(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初期データ取得とリフレッシュ対応
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, refreshTrigger]);

  // ユーザー削除（userServiceにdeleteUserメソッドがあると仮定）
  const handleDelete = useCallback(async (user: User): Promise<void> => {
    try {
      setLoading(true);
      // Note: userServiceにdeleteUserメソッドが実装されている前提
      // await userService.deleteUser(user.id);
      
      // 暫定的に未実装のメッセージを表示
      setError('ユーザーの削除機能は現在開発中です');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ユーザーの削除に失敗しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 編集ハンドラー
  const handleEdit = useCallback((user: User): void => {
    onEdit?.(user);
  }, [onEdit]);

  // カラム定義
  const columns = [
    {
      key: 'name' as keyof User,
      label: 'ユーザー名',
      sortable: true,
      searchable: true,
      render: (user: User) => (
        <div className="d-flex align-items-center">
          <div className="me-3">
            <i className="fas fa-user-circle fa-2x text-secondary"></i>
          </div>
          <div>
            <div className="fw-bold">{user.name}</div>
            {user.email && (
              <small className="text-muted">{user.email}</small>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'email' as keyof User,
      label: 'メールアドレス',
      render: (user: User) => (
        <span className="text-muted">
          {user.email || (
            <em className="text-muted">未設定</em>
          )}
        </span>
      )
    },
    {
      key: 'createdAt' as keyof User,
      label: '作成日',
      sortable: true,
      render: (user: User) => (
        <span className="text-muted small">
          {user.createdAt.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      )
    },
    {
      key: 'updatedAt' as keyof User,
      label: '更新日',
      sortable: true,
      render: (user: User) => (
        <span className="text-muted small">
          {user.updatedAt.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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
      title="ユーザー一覧"
      items={users}
      columns={columns}
      loading={loading}
      error={error}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onRefresh={fetchUsers}
      searchPlaceholder="ユーザー名やメールで検索..."
      emptyMessage="ユーザーがありません。新規作成してください。"
    />
  );
};

export default UserList;
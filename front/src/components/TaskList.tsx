import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from 'react-bootstrap';
import { Task, Project } from '../types';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import AdminList from './AdminList';

// プロパティ型定義
interface TaskListProps {
  readonly userId: string;
  readonly onEdit?: (task: Task) => void;
  readonly refreshTrigger?: number;
}

const TaskList: React.FC<TaskListProps> = ({
  userId,
  onEdit,
  refreshTrigger = 0
}) => {
  const [tasks, setTasks] = useState<readonly Task[]>([]);
  const [projects, setProjects] = useState<readonly Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // プロジェクト一覧を取得（タスク表示用）
  const fetchProjects = useCallback(async (): Promise<void> => {
    if (!userId) return;

    try {
      const projectsData = await projectService.getProjectsByUserId(userId);
      setProjects(projectsData);
    } catch (err) {
      console.error('プロジェクト一覧の取得に失敗しました:', err);
    }
  }, [userId]);

  // タスク一覧取得
  const fetchTasks = useCallback(async (): Promise<void> => {
    if (!userId) {
      setTasks([]);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const tasksData = await taskService.getTasksByUserId(userId);
      setTasks(tasksData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'タスク一覧の取得に失敗しました';
      setError(errorMessage);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 初期データ取得とリフレッシュ対応
  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, [fetchProjects, fetchTasks, refreshTrigger]);

  // タスク削除（taskServiceにdeleteTaskメソッドがあると仮定）
  const handleDelete = useCallback(async (task: Task): Promise<void> => {
    try {
      setLoading(true);
      // Note: taskServiceにdeleteTaskメソッドが実装されている前提
      // await taskService.deleteTask(task.userId, task.id);
      
      // 暫定的に未実装のメッセージを表示
      setError('タスクの削除機能は現在開発中です');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'タスクの削除に失敗しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 編集ハンドラー
  const handleEdit = useCallback((task: Task): void => {
    onEdit?.(task);
  }, [onEdit]);

  // プロジェクト名を取得
  const getProjectName = (projectId: string): string => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || '不明なプロジェクト';
  };

  // プロジェクトカラーを取得
  const getProjectColor = (projectId: string): string => {
    const project = projects.find(p => p.id === projectId);
    return project?.color || '#6c757d';
  };

  // カラム定義
  const columns = [
    {
      key: 'name' as keyof Task,
      label: 'タスク名',
      sortable: true,
      searchable: true,
      render: (task: Task) => (
        <div>
          <div className="fw-bold">{task.name}</div>
          {task.description && (
            <small className="text-muted">{task.description}</small>
          )}
        </div>
      )
    },
    {
      key: 'projectId' as keyof Task,
      label: 'プロジェクト',
      render: (task: Task) => (
        <div className="d-flex align-items-center">
          <div
            className="rounded-circle me-2"
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: getProjectColor(task.projectId),
              flexShrink: 0
            }}
          />
          <span className="text-muted small">{getProjectName(task.projectId)}</span>
        </div>
      )
    },
    {
      key: 'createdAt' as keyof Task,
      label: '作成日',
      sortable: true,
      render: (task: Task) => (
        <span className="text-muted small">
          {task.createdAt.toLocaleDateString('ja-JP', {
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
      title="タスク一覧"
      items={tasks}
      columns={columns}
      loading={loading}
      error={error}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onRefresh={fetchTasks}
      searchPlaceholder="タスク名で検索..."
      emptyMessage={
        userId 
          ? "タスクがありません。新規作成してください。"
          : "ユーザーを選択してください。"
      }
    />
  );
};

export default TaskList;
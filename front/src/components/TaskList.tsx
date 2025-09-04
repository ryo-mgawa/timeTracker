import React, { useState, useEffect, useCallback } from 'react';
import { Badge, Form, Row, Col } from 'react-bootstrap';
import { Task, Project } from '../types';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import AdminList from './AdminList';
import TaskDetailModal from './TaskDetailModal';

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
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(''); // プロジェクトフィルター用

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

  // タスク削除
  const handleDelete = useCallback(async (task: Task): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      
      // タスクを削除
      await taskService.deleteTask(task.userId, task.id);
      
      // タスク一覧を更新
      await fetchTasks();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'タスクの削除に失敗しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchTasks]);

  // 編集ハンドラー
  const handleEdit = useCallback((task: Task): void => {
    onEdit?.(task);
  }, [onEdit]);

  // 詳細表示ハンドラー
  const handleItemClick = useCallback((task: Task): void => {
    const project = projects.find(p => p.id === task.projectId);
    setSelectedTask(task);
    setSelectedProject(project || null);
    setShowDetailModal(true);
  }, [projects]);

  // 詳細モーダル削除ハンドラー
  const handleDetailDelete = useCallback(async (taskId: string): Promise<void> => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await handleDelete(task);
    }
  }, [tasks, handleDelete]);

  // プロジェクトフィルタリング
  const filteredTasks = useCallback((): readonly Task[] => {
    if (!selectedProjectId) {
      return tasks; // 全て表示
    }
    return tasks.filter(task => task.projectId === selectedProjectId);
  }, [tasks, selectedProjectId]);

  // プロジェクト選択ハンドラー
  const handleProjectChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedProjectId(event.target.value);
  }, []);

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
            <small className="text-muted" style={{whiteSpace: 'pre-line'}}>{task.description}</small>
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
    }
  ];

  return (
    <>
      {/* プロジェクトフィルター */}
      <div className="mb-3">
        <Row>
          <Col md={4}>
            <Form.Group>
              <Form.Label>プロジェクトで絞り込み</Form.Label>
              <Form.Select 
                value={selectedProjectId} 
                onChange={handleProjectChange}
                disabled={loading}
              >
                <option value="">全てのプロジェクト</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </div>

      <AdminList
        title="タスク一覧"
        items={filteredTasks()}
        columns={columns}
        loading={loading}
        error={error}
        onItemClick={handleItemClick}
        onRefresh={fetchTasks}
        searchPlaceholder="タスク名で検索..."
        emptyMessage={
          userId 
            ? (selectedProjectId 
                ? `選択されたプロジェクトにタスクがありません。`
                : "タスクがありません。新規作成してください。")
            : "ユーザーを選択してください。"
        }
      />

      <TaskDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        task={selectedTask}
        project={selectedProject}
        onDelete={handleDetailDelete}
        loading={loading}
      />
    </>
  );
};

export default TaskList;
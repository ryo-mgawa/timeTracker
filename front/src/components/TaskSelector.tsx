import React, { useState, useEffect } from 'react';
import { ListGroup, Spinner, Alert } from 'react-bootstrap';
import { Task, Project } from 'types';
import { taskService } from 'services/taskService';
import '../styles/selectors.css';

interface TaskSelectorProps {
  readonly selectedProject: Project | null;
  readonly selectedTask: Task | null;
  readonly onTaskSelect: (task: Task | null) => void;
  readonly userId: string;
}

const TaskSelector: React.FC<TaskSelectorProps> = ({
  selectedProject,
  selectedTask,
  onTaskSelect,
  userId
}) => {
  const [tasks, setTasks] = useState<readonly Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // タスク一覧を取得
  useEffect(() => {
    const fetchTasks = async (): Promise<void> => {
      // アーリーリターン - プロジェクトが選択されていない場合
      if (!selectedProject?.id) {
        setTasks([]);
        setLoading(false);
        onTaskSelect(null); // タスク選択をクリア
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        const fetchedTasks = await taskService.getTasksByProjectId(userId, selectedProject.id);
        setTasks(fetchedTasks);
        
        // 選択中のタスクが新しいプロジェクトに存在しない場合はクリア
        if (selectedTask && !fetchedTasks.find(task => task.id === selectedTask.id)) {
          onTaskSelect(null);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'タスク一覧の取得に失敗しました';
        setError(errorMessage);
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [selectedProject?.id, selectedTask, onTaskSelect, userId]);

  // タスク選択ハンドラー
  const handleTaskSelect = (task: Task): void => {
    // 同じタスクをクリックした場合は選択解除
    if (selectedTask?.id === task.id) {
      onTaskSelect(null);
    } else {
      onTaskSelect(task);
    }
  };

  // プロジェクトが選択されていない場合
  if (!selectedProject) {
    return (
      <div className="selector-empty">
        プロジェクトを先に選択してください
      </div>
    );
  }

  // ローディング表示
  if (loading) {
    return (
      <div className="selector-loading">
        <Spinner animation="border" size="sm" className="me-2" />
        <small>タスク読み込み中...</small>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="selector-error">
        {error}
      </div>
    );
  }

  // タスクが0件の場合
  if (tasks.length === 0) {
    return (
      <div className="selector-empty">
        このプロジェクトにはタスクがありません
      </div>
    );
  }

  return (
    <ListGroup variant="flush" className="selector-container">
      {tasks.map((task) => (
        <ListGroup.Item
          key={task.id}
          action
          active={selectedTask?.id === task.id}
          onClick={() => handleTaskSelect(task)}
          className="d-flex justify-content-between align-items-center py-2 px-3"
        >
          <div>
            <div className="fw-bold small">{task.name}</div>
            {task.description && (
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                {task.description}
              </div>
            )}
          </div>
          {selectedTask?.id === task.id && (
            <small className="selector-checkmark">✓</small>
          )}
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default TaskSelector;
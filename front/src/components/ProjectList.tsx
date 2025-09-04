import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from 'react-bootstrap';
import { Project } from '../types';
import { projectService } from '../services/projectService';
import AdminList from './AdminList';
import ProjectDetailModal from './ProjectDetailModal';

// プロパティ型定義
interface ProjectListProps {
  readonly userId: string;
  readonly onEdit?: (project: Project) => void;
  readonly refreshTrigger?: number;
}

const ProjectList: React.FC<ProjectListProps> = ({
  userId,
  onEdit,
  refreshTrigger = 0
}) => {
  const [projects, setProjects] = useState<readonly Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

  // プロジェクト一覧取得
  const fetchProjects = useCallback(async (): Promise<void> => {
    if (!userId) {
      setProjects([]);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const projectsData = await projectService.getProjectsByUserId(userId);
      setProjects(projectsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'プロジェクト一覧の取得に失敗しました';
      setError(errorMessage);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 初期データ取得とリフレッシュ対応
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects, refreshTrigger]);

  // プロジェクト削除
  const handleDelete = useCallback(async (project: Project): Promise<void> => {
    try {
      setLoading(true);
      await projectService.deleteProject(project.userId, project.id);
      
      // 一覧を更新
      await fetchProjects();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'プロジェクトの削除に失敗しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchProjects]);

  // 編集ハンドラー
  const handleEdit = useCallback((project: Project): void => {
    onEdit?.(project);
  }, [onEdit]);

  // 詳細表示ハンドラー
  const handleItemClick = useCallback((project: Project): void => {
    setSelectedProject(project);
    setShowDetailModal(true);
  }, []);

  // 詳細モーダル削除ハンドラー
  const handleDetailDelete = useCallback(async (projectId: string): Promise<void> => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      await handleDelete(project);
    }
  }, [projects, handleDelete]);

  // カラム定義
  const columns = [
    {
      key: 'name' as keyof Project,
      label: 'プロジェクト名',
      sortable: true,
      searchable: true,
      render: (project: Project) => (
        <div className="d-flex align-items-center">
          <div
            className="rounded-circle me-2"
            style={{
              width: '16px',
              height: '16px',
              backgroundColor: project.color,
              flexShrink: 0
            }}
          />
          <strong>{project.name}</strong>
        </div>
      )
    },
    {
      key: 'description' as keyof Project,
      label: '説明',
      render: (project: Project) => (
        <span className="text-muted">
          {project.description || '説明なし'}
        </span>
      )
    },
    {
      key: 'color' as keyof Project,
      label: 'カラー',
      render: (project: Project) => (
        <div className="d-flex align-items-center">
          <div
            className="rounded me-2"
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: project.color,
              border: '1px solid #dee2e6'
            }}
          />
          <code className="text-muted small">{project.color}</code>
        </div>
      )
    },
    {
      key: 'createdAt' as keyof Project,
      label: '作成日',
      sortable: true,
      render: (project: Project) => (
        <span className="text-muted small">
          {project.createdAt.toLocaleDateString('ja-JP', {
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
      <AdminList
        title="プロジェクト一覧"
        items={projects}
        columns={columns}
        loading={loading}
        error={error}
        onItemClick={handleItemClick}
        onRefresh={fetchProjects}
        searchPlaceholder="プロジェクト名で検索..."
        emptyMessage={
          userId 
            ? "プロジェクトがありません。新規作成してください。"
            : "ユーザーを選択してください。"
        }
      />

      <ProjectDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        project={selectedProject}
        onDelete={handleDetailDelete}
        loading={loading}
      />
    </>
  );
};

export default ProjectList;
import React, { useState, useEffect } from 'react';
import { ListGroup, Spinner, Alert } from 'react-bootstrap';
import { Project, User } from 'types';
import { projectService } from 'services/projectService';

interface ProjectSelectorProps {
  readonly user: User;
  readonly selectedProject: Project | null;
  readonly onProjectSelect: (project: Project | null) => void;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  user,
  selectedProject,
  onProjectSelect
}) => {
  const [projects, setProjects] = useState<readonly Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // プロジェクト一覧を取得
  useEffect(() => {
    const fetchProjects = async (): Promise<void> => {
      // アーリーリターン - ユーザーがない場合
      if (!user?.id) {
        setProjects([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        const fetchedProjects = await projectService.getProjectsByUserId(user.id);
        setProjects(fetchedProjects);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'プロジェクト一覧の取得に失敗しました';
        setError(errorMessage);
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user?.id]);

  // プロジェクト選択ハンドラー
  const handleProjectSelect = (project: Project): void => {
    // 同じプロジェクトをクリックした場合は選択解除
    if (selectedProject?.id === project.id) {
      onProjectSelect(null);
    } else {
      onProjectSelect(project);
    }
  };

  // ローディング表示
  if (loading) {
    return (
      <div className="text-center p-3">
        <Spinner animation="border" size="sm" className="me-2" />
        <small className="text-muted">プロジェクト読み込み中...</small>
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

  // プロジェクトが0件の場合
  if (projects.length === 0) {
    return (
      <div className="text-center p-3">
        <small className="text-muted">利用可能なプロジェクトがありません</small>
      </div>
    );
  }

  return (
    <ListGroup variant="flush">
      {projects.map((project) => (
        <ListGroup.Item
          key={project.id}
          action
          active={selectedProject?.id === project.id}
          onClick={() => handleProjectSelect(project)}
          className="d-flex justify-content-between align-items-center py-2 px-3"
        >
          <div className="d-flex align-items-center">
            <div
              className="rounded me-2"
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: project.color || '#007bff'
              }}
            />
            <div>
              <div className="fw-bold small">{project.name}</div>
              {project.description && (
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {project.description}
                </div>
              )}
            </div>
          </div>
          {selectedProject?.id === project.id && (
            <small className="text-primary">✓</small>
          )}
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default ProjectSelector;
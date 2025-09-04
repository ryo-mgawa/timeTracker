import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { Project } from '../types';

// プロパティ型定義
interface TaskCreateModalProps {
  readonly show: boolean;
  readonly onHide: () => void;
  readonly userId: string;
  readonly onSuccess?: () => void;
}

// フォームデータ型
interface TaskFormData {
  name: string;
  description: string;
  projectId: string;
}

const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  show,
  onHide,
  userId,
  onSuccess
}) => {
  const [formData, setFormData] = useState<TaskFormData>({
    name: '',
    description: '',
    projectId: ''
  });
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [projectsLoading, setProjectsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // プロジェクト一覧取得
  const fetchProjects = useCallback(async (): Promise<void> => {
    if (!userId) return;

    try {
      setProjectsLoading(true);
      const projectsData = await projectService.getProjectsByUserId(userId);
      setProjects(projectsData as Project[]);
      
      // 最初のプロジェクトを自動選択
      if (projectsData.length > 0 && !formData.projectId) {
        setFormData(prev => ({
          ...prev,
          projectId: projectsData[0].id
        }));
      }
    } catch (error) {
      console.error('プロジェクト一覧の取得に失敗しました:', error);
      setError('プロジェクト一覧の取得に失敗しました');
    } finally {
      setProjectsLoading(false);
    }
  }, [userId, formData.projectId]);

  // モーダル表示時にプロジェクト一覧を取得
  useEffect(() => {
    if (show && userId) {
      fetchProjects();
    }
  }, [show, userId, fetchProjects]);

  // フォームデータ更新ハンドラー
  const handleInputChange = (field: keyof TaskFormData, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // エラークリア
    if (error) setError('');
  };

  // フォーム送信ハンドラー
  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    
    // アーリーリターン - バリデーション
    if (!formData.name.trim()) {
      setError('タスク名は必須です');
      return;
    }

    if (!formData.projectId) {
      setError('プロジェクトを選択してください');
      return;
    }

    if (!userId) {
      setError('ユーザーが選択されていません');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // タスク作成
      await taskService.createTask({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        projectId: formData.projectId,
        userId: userId
      });

      // 成功時の処理
      onSuccess?.();
      handleClose();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'タスクの作成に失敗しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // モーダルを閉じる処理
  const handleClose = (): void => {
    if (!loading) {
      // フォームデータをリセット
      setFormData({
        name: '',
        description: '',
        projectId: ''
      });
      setProjects([]);
      setError('');
      onHide();
    }
  };

  // 選択されたプロジェクト情報を取得
  const selectedProject = projects.find(p => p.id === formData.projectId);

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton className="bg-info text-white">
        <Modal.Title>
          <i className="fas fa-tasks me-2"></i>
          新規タスク作成
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          {/* エラー表示 */}
          {error && (
            <Alert variant="danger" className="mb-4">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          {/* プロジェクト選択 */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">
              所属プロジェクト <span className="text-danger">*</span>
            </Form.Label>
            {projectsLoading ? (
              <div className="text-center py-3">
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                プロジェクト一覧を読み込み中...
              </div>
            ) : projects.length === 0 ? (
              <Alert variant="warning">
                <i className="fas fa-exclamation-triangle me-2"></i>
                プロジェクトが見つかりません。先にプロジェクトを作成してください。
              </Alert>
            ) : (
              <>
                <Form.Select
                  value={formData.projectId}
                  onChange={(e) => handleInputChange('projectId', e.target.value)}
                  disabled={loading}
                  required
                >
                  <option value="">プロジェクトを選択してください</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </Form.Select>
                
                {/* 選択されたプロジェクトのプレビュー */}
                {selectedProject && (
                  <div className="mt-3 p-3 border rounded bg-light">
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle me-3"
                        style={{
                          width: '20px',
                          height: '20px',
                          backgroundColor: selectedProject.color
                        }}
                      />
                      <div>
                        <div className="fw-bold">{selectedProject.name}</div>
                        {selectedProject.description && (
                          <small className="text-muted">{selectedProject.description}</small>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </Form.Group>

          <Row className="mb-4">
            {/* タスク名 */}
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">
                  タスク名 <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="タスク名を入力してください（例：ユーザー認証機能開発）"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={loading || projects.length === 0}
                  maxLength={50}
                  required
                />
                <Form.Text className="text-muted">
                  最大50文字まで入力できます
                </Form.Text>
              </Form.Group>
            </Col>

            {/* タスクプレビュー */}
            <Col md={4}>
              <Form.Label className="fw-bold">プレビュー</Form.Label>
              <div 
                className="border rounded p-3 text-center"
                style={{ 
                  backgroundColor: selectedProject?.color || '#6c757d', 
                  color: 'white',
                  minHeight: '60px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <div>
                  <small>{selectedProject?.name || 'プロジェクト'}</small>
                  <div className="fw-bold">
                    {formData.name || 'タスク名'}
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* タスク説明 */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">説明（任意）</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="タスクの詳細説明を入力してください（任意）&#10;例：ユーザーログイン・ログアウト機能の実装&#10;- JWT認証の実装&#10;- セッション管理&#10;- パスワードリセット機能"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={loading || projects.length === 0}
              maxLength={500}
            />
            <Form.Text className="text-muted">
              最大500文字まで入力できます
            </Form.Text>
          </Form.Group>

          {/* タスク作成のヒント */}
          <Alert variant="info" className="mb-0">
            <Alert.Heading className="fs-6">
              <i className="fas fa-lightbulb me-2"></i>
              タスク作成のポイント
            </Alert.Heading>
            <ul className="mb-0 mt-2">
              <li><strong>具体的な名前</strong> - 「ユーザー認証機能開発」「バグ修正#123」など</li>
              <li><strong>適切なサイズ</strong> - 1-5日程度で完了できる粒度に分割</li>
              <li><strong>明確な成果物</strong> - 何が完成すれば終了かを明確に</li>
              <li><strong>詳細な説明</strong> - 後で見返してもわかる詳細を記載</li>
            </ul>
          </Alert>
        </Modal.Body>

        <Modal.Footer className="bg-light">
          <Button 
            variant="secondary" 
            onClick={handleClose}
            disabled={loading}
          >
            <i className="fas fa-times me-2"></i>
            キャンセル
          </Button>
          <Button 
            variant="info" 
            type="submit"
            disabled={loading || !formData.name.trim() || !formData.projectId || projects.length === 0}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                作成中...
              </>
            ) : (
              <>
                <i className="fas fa-plus me-2"></i>
                タスク作成
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default TaskCreateModal;
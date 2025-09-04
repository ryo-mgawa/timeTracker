import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { projectService } from '../services/projectService';

// プロパティ型定義
interface ProjectCreateModalProps {
  readonly show: boolean;
  readonly onHide: () => void;
  readonly userId: string;
  readonly onSuccess?: () => void;
}

// フォームデータ型
interface ProjectFormData {
  name: string;
  description: string;
  color: string;
}

// プリセットカラー
const PRESET_COLORS = [
  '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8',
  '#6f42c1', '#fd7e14', '#e83e8c', '#20c997', '#6c757d'
] as const;

const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({
  show,
  onHide,
  userId,
  onSuccess
}) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    color: PRESET_COLORS[0]
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // フォームデータ更新ハンドラー
  const handleInputChange = (field: keyof ProjectFormData, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // エラークリア
    if (error) setError('');
  };

  // カラー選択ハンドラー
  const handleColorSelect = (color: string): void => {
    handleInputChange('color', color);
  };

  // フォーム送信ハンドラー
  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    
    // アーリーリターン - バリデーション
    if (!formData.name.trim()) {
      setError('プロジェクト名は必須です');
      return;
    }

    if (!userId) {
      setError('ユーザーが選択されていません');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // プロジェクト作成
      await projectService.createProject({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        color: formData.color,
        userId: userId
      });

      // 成功時の処理
      onSuccess?.();
      handleClose();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'プロジェクトの作成に失敗しました';
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
        color: PRESET_COLORS[0]
      });
      setError('');
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <i className="fas fa-folder-plus me-2"></i>
          新規プロジェクト作成
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

          <Row className="mb-4">
            {/* プロジェクト名 */}
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">
                  プロジェクト名 <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="プロジェクト名を入力してください"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={loading}
                  maxLength={50}
                  required
                />
                <Form.Text className="text-muted">
                  最大50文字まで入力できます
                </Form.Text>
              </Form.Group>
            </Col>

            {/* カラープレビュー */}
            <Col md={4}>
              <Form.Label className="fw-bold">プレビュー</Form.Label>
              <div 
                className="border rounded p-3 text-center text-white fw-bold"
                style={{ backgroundColor: formData.color, minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {formData.name || 'プロジェクト名'}
              </div>
            </Col>
          </Row>

          {/* プロジェクト説明 */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">説明（任意）</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="プロジェクトの説明を入力してください（任意）"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={loading}
              maxLength={200}
            />
            <Form.Text className="text-muted">
              最大200文字まで入力できます
            </Form.Text>
          </Form.Group>

          {/* カラー選択 */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">
              プロジェクトカラー <span className="text-danger">*</span>
            </Form.Label>
            <div className="d-flex flex-wrap gap-2 mt-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`btn p-0 rounded-circle ${formData.color === color ? 'border border-dark border-3' : 'border border-light'}`}
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: color,
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => handleColorSelect(color)}
                  disabled={loading}
                  title={`カラー: ${color}`}
                />
              ))}
            </div>
            <Form.Text className="text-muted">
              プロジェクトを識別しやすい色を選択してください
            </Form.Text>
          </Form.Group>

          {/* カスタムカラー入力 */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">カスタムカラー（任意）</Form.Label>
            <div className="d-flex align-items-center gap-2">
              <Form.Control
                type="color"
                value={formData.color}
                onChange={(e) => handleColorSelect(e.target.value)}
                disabled={loading}
                style={{ width: '60px', height: '40px' }}
              />
              <Form.Control
                type="text"
                placeholder="#007bff"
                value={formData.color}
                onChange={(e) => handleColorSelect(e.target.value)}
                disabled={loading}
                pattern="^#[0-9A-Fa-f]{6}$"
                style={{ maxWidth: '100px' }}
              />
            </div>
            <Form.Text className="text-muted">
              お好みの色を直接指定できます
            </Form.Text>
          </Form.Group>
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
            variant="primary" 
            type="submit"
            disabled={loading || !formData.name.trim()}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                作成中...
              </>
            ) : (
              <>
                <i className="fas fa-plus me-2"></i>
                プロジェクト作成
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProjectCreateModal;
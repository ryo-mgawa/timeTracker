import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { categoryService } from '../services/categoryService';

// プロパティ型定義
interface CategoryCreateModalProps {
  readonly show: boolean;
  readonly onHide: () => void;
  readonly userId: string;
  readonly onSuccess?: () => void;
}

// フォームデータ型
interface CategoryFormData {
  name: string;
  description: string;
  color: string;
}

// プリセットカラー（分類用の色合い）
const PRESET_COLORS = [
  '#28a745', '#17a2b8', '#ffc107', '#fd7e14', '#e83e8c',
  '#6f42c1', '#dc3545', '#007bff', '#20c997', '#6c757d',
  '#f8f9fa', '#343a40', '#495057', '#adb5bd', '#ced4da'
] as const;

const CategoryCreateModal: React.FC<CategoryCreateModalProps> = ({
  show,
  onHide,
  userId,
  onSuccess
}) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    color: PRESET_COLORS[0]
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // フォームデータ更新ハンドラー
  const handleInputChange = (field: keyof CategoryFormData, value: string): void => {
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
      setError('分類名は必須です');
      return;
    }

    if (!userId) {
      setError('ユーザーが選択されていません');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // 分類作成
      await categoryService.createCategory({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        color: formData.color,
        userId: userId
      });

      // 成功時の処理
      onSuccess?.();
      handleClose();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '分類の作成に失敗しました';
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
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title>
          <i className="fas fa-tags me-2"></i>
          新規分類作成
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
            {/* 分類名 */}
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">
                  分類名 <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="分類名を入力してください（例：開発、設計、会議など）"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={loading}
                  maxLength={30}
                  required
                />
                <Form.Text className="text-muted">
                  最大30文字まで入力できます
                </Form.Text>
              </Form.Group>
            </Col>

            {/* カラープレビュー */}
            <Col md={4}>
              <Form.Label className="fw-bold">プレビュー</Form.Label>
              <div className="text-center">
                <span 
                  className="badge px-3 py-2 fw-bold fs-6"
                  style={{ 
                    backgroundColor: formData.color,
                    color: formData.color === '#f8f9fa' || formData.color === '#ced4da' || formData.color === '#adb5bd' ? '#000' : '#fff'
                  }}
                >
                  {formData.name || '分類名'}
                </span>
              </div>
            </Col>
          </Row>

          {/* 分類説明 */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">説明（任意）</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="この分類の詳細説明を入力してください（任意）&#10;例：システム開発に関する作業全般"
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
              分類カラー <span className="text-danger">*</span>
            </Form.Label>
            <div className="d-flex flex-wrap gap-2 mt-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`btn p-0 rounded-circle ${formData.color === color ? 'border border-dark border-3' : 'border border-light'}`}
                  style={{
                    width: '35px',
                    height: '35px',
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
              作業分類を見分けやすい色を選択してください
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
                placeholder="#28a745"
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

          {/* 分類使用例の説明 */}
          <Alert variant="info" className="mb-0">
            <Alert.Heading className="fs-6">
              <i className="fas fa-lightbulb me-2"></i>
              分類の使用例
            </Alert.Heading>
            <ul className="mb-0 mt-2">
              <li><strong>開発</strong> - プログラミング、コーディング作業</li>
              <li><strong>設計</strong> - システム設計、仕様策定</li>
              <li><strong>会議</strong> - 定例会議、打ち合わせ</li>
              <li><strong>レビュー</strong> - コードレビュー、設計レビュー</li>
              <li><strong>調査</strong> - 技術調査、要件調査</li>
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
            variant="success" 
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
                分類作成
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CategoryCreateModal;
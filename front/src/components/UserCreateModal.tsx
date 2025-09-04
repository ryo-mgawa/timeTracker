import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { userService } from '../services/userService';

// プロパティ型定義
interface UserCreateModalProps {
  readonly show: boolean;
  readonly onHide: () => void;
  readonly onSuccess?: () => void;
}

// フォームデータ型
interface UserFormData {
  name: string;
  email: string;
}

const UserCreateModal: React.FC<UserCreateModalProps> = ({
  show,
  onHide,
  onSuccess
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: ''
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // フォームデータ更新ハンドラー
  const handleInputChange = (field: keyof UserFormData, value: string): void => {
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
      setError('ユーザー名は必須です');
      return;
    }

    // メールアドレスのバリデーション（入力された場合のみ）
    if (formData.email.trim() && !isValidEmail(formData.email.trim())) {
      setError('正しいメールアドレスを入力してください');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // ユーザー作成
      await userService.createUser({
        name: formData.name.trim(),
        email: formData.email.trim() || undefined
      });

      // 成功時の処理
      onSuccess?.();
      handleClose();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ユーザーの作成に失敗しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // メールアドレスのバリデーション
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // モーダルを閉じる処理
  const handleClose = (): void => {
    if (!loading) {
      // フォームデータをリセット
      setFormData({
        name: '',
        email: ''
      });
      setError('');
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton className="bg-warning text-dark">
        <Modal.Title>
          <i className="fas fa-user-plus me-2"></i>
          新規ユーザー作成
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
            {/* ユーザー名 */}
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">
                  ユーザー名 <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="ユーザー名を入力してください（例：山田太郎）"
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

            {/* ユーザープレビュー */}
            <Col md={4}>
              <Form.Label className="fw-bold">プレビュー</Form.Label>
              <div className="border rounded p-3 text-center bg-light">
                <div className="mb-2">
                  <i className="fas fa-user-circle fa-3x text-secondary"></i>
                </div>
                <div className="fw-bold text-dark">
                  {formData.name || 'ユーザー名'}
                </div>
                {formData.email && (
                  <small className="text-muted">{formData.email}</small>
                )}
              </div>
            </Col>
          </Row>

          {/* メールアドレス */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">メールアドレス（任意）</Form.Label>
            <Form.Control
              type="email"
              placeholder="メールアドレスを入力してください（例：user@example.com）"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={loading}
              maxLength={100}
            />
            <Form.Text className="text-muted">
              最大100文字まで入力できます。将来のログイン機能で使用される予定です。
            </Form.Text>
          </Form.Group>

          {/* ユーザー作成のガイダンス */}
          <Alert variant="info" className="mb-0">
            <Alert.Heading className="fs-6">
              <i className="fas fa-info-circle me-2"></i>
              ユーザー作成について
            </Alert.Heading>
            <ul className="mb-0 mt-2">
              <li><strong>識別しやすい名前</strong> - フルネームまたは識別しやすいニックネーム</li>
              <li><strong>メールアドレス</strong> - 将来のログイン機能や通知で使用</li>
              <li><strong>作成後の利用</strong> - プロジェクト・タスク・工数入力の対象ユーザーとして選択可能</li>
              <li><strong>データ管理</strong> - 作成後もユーザー情報は編集可能です</li>
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
            variant="warning" 
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
                ユーザー作成
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UserCreateModal;
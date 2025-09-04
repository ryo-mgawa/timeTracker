import React, { useState } from 'react';
import { Modal, Button, Row, Col, Card, Badge, Alert } from 'react-bootstrap';
import { User } from 'types';

interface UserDetailModalProps {
  readonly show: boolean;
  readonly onHide: () => void;
  readonly user: User | null;
  readonly onDelete?: (userId: string) => void;
  readonly loading?: boolean;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  show,
  onHide,
  user,
  onDelete,
  loading = false
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!user) {
    return (
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>ユーザー詳細</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-5">
          <Alert variant="warning">
            <i className="fas fa-exclamation-triangle me-2"></i>
            データの読み込みに問題があります
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            閉じる
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  const handleDelete = (): void => {
    if (!user) return;
    onDelete?.(user.id);
    setShowDeleteConfirm(false);
    onHide();
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="d-flex align-items-center">
          <i className="fas fa-user me-2 text-info"></i>
          ユーザー詳細
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-4">
        {/* 基本情報カード */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Header className="bg-info text-white">
            <h5 className="mb-0">
              <i className="fas fa-info-circle me-2"></i>
              基本情報
            </h5>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col xs={12}>
                <div className="d-flex align-items-center mb-3">
                  <div className="me-3">
                    <i className="fas fa-user-circle fa-3x text-secondary"></i>
                  </div>
                  <div>
                    <div className="mb-1">
                      <strong className="text-muted me-2">ユーザー名:</strong>
                      <span className="fw-bold fs-5">{user.name}</span>
                    </div>
                    <div>
                      <strong className="text-muted me-2">メールアドレス:</strong>
                      {user.email ? (
                        <span className="text-muted">
                          <i className="fas fa-envelope me-1"></i>
                          {user.email}
                        </span>
                      ) : (
                        <Badge bg="secondary" className="px-2 py-1">
                          <i className="fas fa-times me-1"></i>
                          未設定
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* ユーザー詳細情報カード */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Header className="bg-dark text-white">
            <h5 className="mb-0">
              <i className="fas fa-id-card me-2"></i>
              詳細情報
            </h5>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col xs={12}>
                <div className="mb-3">
                  <strong className="text-muted">ユーザーID:</strong>
                  <div className="mt-1">
                    <code className="bg-light p-2 rounded small">{user.id}</code>
                  </div>
                </div>
              </Col>
              <Col xs={12}>
                <div className="mb-3">
                  <strong className="text-muted">アカウント状態:</strong>
                  <div className="mt-1">
                    <Badge bg={user.deletedAt ? 'danger' : 'success'} className="px-3 py-2">
                      <i className={`fas ${user.deletedAt ? 'fa-user-slash' : 'fa-user-check'} me-2`}></i>
                      {user.deletedAt ? '削除済み' : 'アクティブ'}
                    </Badge>
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* 作成・更新情報カード */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Header className="bg-secondary text-white">
            <h5 className="mb-0">
              <i className="fas fa-calendar me-2"></i>
              作成・更新情報
            </h5>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={6}>
                <div className="text-center p-3 bg-light rounded">
                  <div className="text-muted small mb-1">作成日時</div>
                  <div className="fw-medium">
                    <i className="fas fa-user-plus me-2 text-success"></i>
                    {formatDate(user.createdAt)}
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="text-center p-3 bg-light rounded">
                  <div className="text-muted small mb-1">最終更新</div>
                  <div className="fw-medium">
                    <i className="fas fa-edit me-2 text-warning"></i>
                    {formatDate(user.updatedAt)}
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* 削除確認アラート */}
        {showDeleteConfirm && (
          <Alert variant="danger" className="mb-0">
            <Alert.Heading className="h6">
              <i className="fas fa-exclamation-triangle me-2"></i>
              削除確認
            </Alert.Heading>
            <p className="mb-3">
              ユーザー「<strong>{user.name}</strong>」を削除してもよろしいですか？<br />
              <strong className="text-danger">この操作は取り消せません。</strong><br />
              <small className="text-muted">このユーザーに関連するプロジェクト、タスク、工数データも影響を受ける可能性があります。</small>
            </p>
            <div className="d-flex gap-2">
              <Button 
                variant="danger" 
                size="sm" 
                onClick={handleDelete}
                disabled={loading}
              >
                <i className="fas fa-trash me-1"></i>
                削除する
              </Button>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={() => setShowDeleteConfirm(false)}
              >
                キャンセル
              </Button>
            </div>
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer className="bg-light">
        <div className="w-100 d-flex justify-content-between">
          <Button variant="outline-secondary" onClick={onHide} disabled={loading}>
            <i className="fas fa-times me-2"></i>
            閉じる
          </Button>
          
          {!showDeleteConfirm && (
            <Button 
              variant="danger" 
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
            >
              <i className="fas fa-trash me-2"></i>
              削除する
            </Button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default UserDetailModal;
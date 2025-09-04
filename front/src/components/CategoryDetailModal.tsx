import React, { useState } from 'react';
import { Modal, Button, Row, Col, Card, Badge, Alert } from 'react-bootstrap';
import { Category } from 'types';

interface CategoryDetailModalProps {
  readonly show: boolean;
  readonly onHide: () => void;
  readonly category: Category | null;
  readonly onDelete?: (categoryId: string) => void;
  readonly loading?: boolean;
}

const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
  show,
  onHide,
  category,
  onDelete,
  loading = false
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!category) {
    return (
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>分類詳細</Modal.Title>
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
    if (!category) return;
    onDelete?.(category.id);
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

  const getContrastTextColor = (backgroundColor: string): string => {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000' : '#fff';
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="d-flex align-items-center">
          <i className="fas fa-tags me-2 text-success"></i>
          分類詳細
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-4">
        {/* 基本情報カード */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Header className="bg-success text-white">
            <h5 className="mb-0">
              <i className="fas fa-info-circle me-2"></i>
              基本情報
            </h5>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col xs={12}>
                <div className="d-flex align-items-center mb-3">
                  <strong className="text-muted me-3">分類名:</strong>
                  <Badge 
                    style={{ 
                      backgroundColor: category.color,
                      color: getContrastTextColor(category.color)
                    }}
                    className="px-3 py-2 fs-6"
                  >
                    <i className="fas fa-tag me-2"></i>
                    {category.name}
                  </Badge>
                </div>
              </Col>
              <Col xs={12}>
                <div className="mb-3">
                  <strong className="text-muted">カラー:</strong>
                  <div className="mt-2 d-flex align-items-center">
                    <Badge 
                      style={{ 
                        backgroundColor: category.color,
                        color: getContrastTextColor(category.color)
                      }}
                      className="px-3 py-2 me-3"
                    >
                      {category.name}
                    </Badge>
                    <code className="text-muted small">{category.color}</code>
                    <div
                      className="rounded ms-3"
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: category.color,
                        border: '1px solid #dee2e6'
                      }}
                    />
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* 説明カード（説明がある場合のみ表示） */}
        {category.description && (
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">
                <i className="fas fa-file-text me-2"></i>
                説明
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                {category.description}
              </p>
            </Card.Body>
          </Card>
        )}

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
                    <i className="fas fa-plus-circle me-2 text-success"></i>
                    {formatDate(category.createdAt)}
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="text-center p-3 bg-light rounded">
                  <div className="text-muted small mb-1">最終更新</div>
                  <div className="fw-medium">
                    <i className="fas fa-edit me-2 text-warning"></i>
                    {formatDate(category.updatedAt)}
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
              分類「<strong>{category.name}</strong>」を削除してもよろしいですか？<br />
              <strong className="text-danger">この操作は取り消せません。</strong><br />
              <small className="text-muted">この分類で登録された工数データも影響を受ける可能性があります。</small>
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

export default CategoryDetailModal;
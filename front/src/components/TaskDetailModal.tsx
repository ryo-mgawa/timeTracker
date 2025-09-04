import React, { useState } from 'react';
import { Modal, Button, Row, Col, Card, Badge, Alert } from 'react-bootstrap';
import { Task, Project } from 'types';

interface TaskDetailModalProps {
  readonly show: boolean;
  readonly onHide: () => void;
  readonly task: Task | null;
  readonly project?: Project | null;
  readonly onDelete?: (taskId: string) => void;
  readonly loading?: boolean;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  show,
  onHide,
  task,
  project,
  onDelete,
  loading = false
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!task) {
    return (
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>タスク詳細</Modal.Title>
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
    if (!task) return;
    onDelete?.(task.id);
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
          <i className="fas fa-tasks me-2 text-warning"></i>
          タスク詳細
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-4">
        {/* 基本情報カード */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Header className="bg-warning text-dark">
            <h5 className="mb-0">
              <i className="fas fa-info-circle me-2"></i>
              基本情報
            </h5>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col xs={12}>
                <div className="d-flex align-items-center mb-3">
                  <strong className="text-muted me-3">タスク名:</strong>
                  <span className="fw-bold fs-5">
                    <i className="fas fa-check-square me-2 text-warning"></i>
                    {task.name}
                  </span>
                </div>
              </Col>
              {project && (
                <Col xs={12}>
                  <div className="d-flex align-items-center mb-3">
                    <strong className="text-muted me-3">プロジェクト:</strong>
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
                      <Badge 
                        style={{ 
                          backgroundColor: project.color,
                          color: getContrastTextColor(project.color)
                        }}
                        className="px-3 py-2"
                      >
                        {project.name}
                      </Badge>
                    </div>
                  </div>
                </Col>
              )}
            </Row>
          </Card.Body>
        </Card>

        {/* 説明カード（説明がある場合のみ表示） */}
        {task.description && (
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">
                <i className="fas fa-file-text me-2"></i>
                説明
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                {task.description}
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
                    {formatDate(task.createdAt)}
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="text-center p-3 bg-light rounded">
                  <div className="text-muted small mb-1">最終更新</div>
                  <div className="fw-medium">
                    <i className="fas fa-edit me-2 text-warning"></i>
                    {formatDate(task.updatedAt)}
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
              タスク「<strong>{task.name}</strong>」を削除してもよろしいですか？<br />
              <strong className="text-danger">この操作は取り消せません。</strong><br />
              <small className="text-muted">このタスクで登録された工数データも影響を受ける可能性があります。</small>
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

export default TaskDetailModal;
import React, { useState } from 'react';
import { Modal, Button, Row, Col, Card, Badge, Alert } from 'react-bootstrap';
import { TimeEntry, Task, Category, Project } from 'types';

// モーダルプロパティ型
interface TimeEntryDetailModalProps {
  readonly show: boolean;
  readonly onHide: () => void;
  readonly timeEntry: TimeEntry | null;
  readonly task: Task | null;
  readonly category: Category | null;
  readonly project: Project | null;
  readonly onDelete?: (timeEntryId: string) => void;
  readonly loading?: boolean;
}

const TimeEntryDetailModal: React.FC<TimeEntryDetailModalProps> = ({
  show,
  onHide,
  timeEntry,
  task,
  category,
  project,
  onDelete,
  loading = false
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // アーリーリターン - データが不足している場合
  if (!timeEntry || !task || !category) {
    return (
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>工数詳細</Modal.Title>
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

  // 時間計算
  const workHours = ((timeEntry.endTime.getTime() - timeEntry.startTime.getTime()) / (1000 * 60 * 60)).toFixed(2);
  
  // 削除処理
  const handleDelete = (): void => {
    if (!timeEntry) return;
    onDelete?.(timeEntry.id);
    setShowDeleteConfirm(false);
    onHide();
  };

  // 時刻フォーマット
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // 日付フォーマット
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="d-flex align-items-center">
          <i className="fas fa-clock me-2 text-primary"></i>
          工数詳細
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-4">
        {/* 基本情報カード */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">
              <i className="fas fa-info-circle me-2"></i>
              基本情報
            </h5>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={6}>
                <div className="d-flex align-items-center mb-3">
                  <strong className="text-muted me-2">プロジェクト:</strong>
                  <Badge 
                    bg="primary" 
                    style={{ backgroundColor: project?.color || '#007bff' }}
                    className="px-3 py-2"
                  >
                    {project?.name || 'プロジェクト名不明'}
                  </Badge>
                </div>
              </Col>
              <Col md={6}>
                <div className="d-flex align-items-center mb-3">
                  <strong className="text-muted me-2">タスク:</strong>
                  <span className="fw-medium">{task.name}</span>
                </div>
              </Col>
              <Col md={6}>
                <div className="d-flex align-items-center mb-3">
                  <strong className="text-muted me-2">分類:</strong>
                  <Badge 
                    bg="success"
                    style={{ backgroundColor: category.color }}
                    className="px-3 py-2"
                  >
                    {category.name}
                  </Badge>
                </div>
              </Col>
              <Col md={6}>
                <div className="d-flex align-items-center mb-3">
                  <strong className="text-muted me-2">工数:</strong>
                  <span className="fw-bold text-primary fs-5">{workHours} 時間</span>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* 時間情報カード */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Header className="bg-success text-white">
            <h5 className="mb-0">
              <i className="fas fa-calendar-alt me-2"></i>
              時間情報
            </h5>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col xs={12}>
                <div className="mb-3">
                  <strong className="text-muted">日付:</strong>
                  <div className="mt-1 fs-6">{formatDate(timeEntry.startTime)}</div>
                </div>
              </Col>
              <Col md={6}>
                <div className="text-center p-3 bg-light rounded">
                  <div className="text-muted small mb-1">開始時刻</div>
                  <div className="fw-bold fs-4 text-success">
                    <i className="fas fa-play me-2"></i>
                    {formatTime(timeEntry.startTime)}
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="text-center p-3 bg-light rounded">
                  <div className="text-muted small mb-1">終了時刻</div>
                  <div className="fw-bold fs-4 text-danger">
                    <i className="fas fa-stop me-2"></i>
                    {formatTime(timeEntry.endTime)}
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* メモ情報（メモがある場合のみ表示） */}
        {timeEntry.memo && (
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">
                <i className="fas fa-sticky-note me-2"></i>
                メモ
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                {timeEntry.memo}
              </p>
            </Card.Body>
          </Card>
        )}

        {/* タスク説明（説明がある場合のみ表示） */}
        {task.description && (
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-secondary text-white">
              <h5 className="mb-0">
                <i className="fas fa-file-text me-2"></i>
                タスク説明
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                {task.description}
              </p>
            </Card.Body>
          </Card>
        )}

        {/* 削除確認アラート */}
        {showDeleteConfirm && (
          <Alert variant="danger" className="mb-0">
            <Alert.Heading className="h6">
              <i className="fas fa-exclamation-triangle me-2"></i>
              削除確認
            </Alert.Heading>
            <p className="mb-3">
              この工数エントリを削除してもよろしいですか？<br />
              <strong>この操作は取り消せません。</strong>
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

export default TimeEntryDetailModal;
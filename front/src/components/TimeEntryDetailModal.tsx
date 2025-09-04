import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Card, Badge, Alert, Form } from 'react-bootstrap';
import { TimeEntry, Task, Category, Project } from 'types';
import { timeEntryService } from '../services/timeEntryService';

// モーダルプロパティ型
interface TimeEntryDetailModalProps {
  readonly show: boolean;
  readonly onHide: () => void;
  readonly timeEntry: TimeEntry | null;
  readonly task: Task | null;
  readonly category: Category | null;
  readonly project: Project | null;
  readonly onDelete?: (timeEntryId: string) => void;
  readonly onUpdate?: (updatedTimeEntry: TimeEntry) => void;
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
  onUpdate,
  loading = false
}) => {
  // React Hooks - 最初に全て配置
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editing, setEditing] = useState(false);

  // ヘルパー関数 - Hooks定義の後、useEffectの前
  const formatTimeForInput = (dateString: string | Date): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatTime = (dateString: string | Date): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (dateString: string | Date): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  // useEffect - ヘルパー関数の後、アーリーリターンの前
  useEffect(() => {
    if (timeEntry) {
      setEditStartTime(formatTimeForInput(timeEntry.startTime));
      setEditEndTime(formatTimeForInput(timeEntry.endTime));
    }
  }, [timeEntry]);

  // アーリーリターン - useEffectの後
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

  // 時間計算 - 型安全にDateオブジェクトに変換
  const startDate = new Date(timeEntry.startTime);
  const endDate = new Date(timeEntry.endTime);
  const workHours = ((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)).toFixed(2);
  
  // ハンドラー関数群 - アーリーリターンの後
  const handleDelete = (): void => {
    if (!timeEntry) return;
    onDelete?.(timeEntry.id);
    setShowDeleteConfirm(false);
    onHide();
  };

  const handleEditStart = (): void => {
    if (!timeEntry) return;
    setEditStartTime(formatTimeForInput(timeEntry.startTime));
    setEditEndTime(formatTimeForInput(timeEntry.endTime));
    setIsEditMode(true);
  };

  const handleEditCancel = (): void => {
    setIsEditMode(false);
    setEditing(false);
  };

  const handleTimeSave = async (): Promise<void> => {
    if (!timeEntry || !onUpdate) return;

    // 時刻の検証 - 型安全にDateオブジェクトを作成
    const startDateTime = new Date(timeEntry.startTime);
    const endDateTime = new Date(timeEntry.endTime);
    
    const [startHour, startMinute] = editStartTime.split(':').map(Number);
    const [endHour, endMinute] = editEndTime.split(':').map(Number);
    
    startDateTime.setHours(startHour, startMinute, 0, 0);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    // 時刻検証
    if (endDateTime <= startDateTime) {
      alert('終了時刻は開始時刻より後である必要があります');
      return;
    }

    // 15分刻み制約チェック
    if (![0, 15, 30, 45].includes(startMinute) || ![0, 15, 30, 45].includes(endMinute)) {
      alert('時刻は15分刻み（0, 15, 30, 45分）で入力してください');
      return;
    }

    setEditing(true);

    try {
      const updatedEntry = await timeEntryService.updateTimeEntry(
        timeEntry.userId,
        timeEntry.id,
        {
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString()
        }
      );
      
      onUpdate(updatedEntry);
      setIsEditMode(false);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update time entry:', error);
      alert('工数の更新に失敗しました');
      setEditing(false);
    }
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
          <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fas fa-calendar-alt me-2"></i>
              時間情報
            </h5>
            {!isEditMode && !showDeleteConfirm && (
              <Button 
                variant="outline-light" 
                size="sm" 
                onClick={handleEditStart}
                disabled={loading}
              >
                <i className="fas fa-edit me-1"></i>
                編集
              </Button>
            )}
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col xs={12}>
                <div className="mb-3">
                  <strong className="text-muted">日付:</strong>
                  <div className="mt-1 fs-6">{formatDate(timeEntry.startTime)}</div>
                </div>
              </Col>
              
              {!isEditMode ? (
                <>
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
                </>
              ) : (
                <>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="text-muted">開始時刻</Form.Label>
                      <Form.Control
                        type="time"
                        value={editStartTime}
                        onChange={(e) => setEditStartTime(e.target.value)}
                        step="900"
                        disabled={editing}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="text-muted">終了時刻</Form.Label>
                      <Form.Control
                        type="time"
                        value={editEndTime}
                        onChange={(e) => setEditEndTime(e.target.value)}
                        step="900"
                        disabled={editing}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} className="mt-3">
                    <div className="d-flex gap-2 justify-content-end">
                      <Button 
                        variant="success" 
                        size="sm" 
                        onClick={handleTimeSave}
                        disabled={editing}
                      >
                        <i className="fas fa-save me-1"></i>
                        {editing ? '保存中...' : '保存'}
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        onClick={handleEditCancel}
                        disabled={editing}
                      >
                        <i className="fas fa-times me-1"></i>
                        キャンセル
                      </Button>
                    </div>
                  </Col>
                </>
              )}
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
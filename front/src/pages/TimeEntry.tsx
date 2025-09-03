import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Nav } from 'react-bootstrap';
import { User, Project, Category, Task, TimeEntry as TimeEntryType } from 'types';
import TimeTrackingCalendar from 'components/Calendar';

interface TimeEntryProps {
  readonly user: User;
}

// タブの種類
type TabType = 'calendar' | 'list';

const TimeEntry: React.FC<TimeEntryProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // アーリーリターン - ユーザーが未選択の場合
  if (!user) {
    return (
      <Container>
        <Card className="text-center p-4">
          <Card.Body>
            <h5>エラー: ユーザーが選択されていません</h5>
            <p>ユーザー選択画面に戻って、ユーザーを選択してください。</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const handleTabSelect = (tab: TabType): void => {
    setActiveTab(tab);
  };

  const handleDateChange = (date: Date): void => {
    if (!date) return;
    setSelectedDate(date);
  };

  const renderTabContent = (): React.ReactElement => {
    switch (activeTab) {
      case 'calendar':
        return (
          <Card>
            <Card.Header>
              <h5 className="mb-0">カレンダービュー</h5>
              <small className="text-muted">
                {selectedDate.toLocaleDateString('ja-JP', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'long'
                })}
              </small>
            </Card.Header>
            <Card.Body>
              <TimeTrackingCalendar
                user={user}
                selectedTask={selectedTask}
                selectedCategory={selectedCategory}
                onTimeEntryCreate={(timeEntry: TimeEntryType) => {
                  console.log('工数エントリが作成されました:', timeEntry);
                }}
                onTimeEntryUpdate={(timeEntry: TimeEntryType) => {
                  console.log('工数エントリが更新されました:', timeEntry);
                }}
                onTimeEntryDelete={(id: string) => {
                  console.log('工数エントリが削除されました:', id);
                }}
              />
            </Card.Body>
          </Card>
        );
      
      case 'list':
        return (
          <Card>
            <Card.Header>
              <h5 className="mb-0">リストビュー</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center p-5">
                <h6 className="text-muted">工数一覧</h6>
                <p className="text-muted">
                  ここに工数エントリの一覧が表示されます
                </p>
              </div>
            </Card.Body>
          </Card>
        );
      
      default:
        return <div>Unknown tab</div>;
    }
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex justify-content-between align-items-center py-3">
              <div>
                <h4 className="mb-1">工数入力</h4>
                <small className="text-muted">
                  ユーザー: {user.name}
                </small>
              </div>
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" size="sm">
                  レポート
                </Button>
                <Button variant="outline-secondary" size="sm">
                  設定
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* サイドバー - プロジェクト・タスク・分類選択 */}
        <Col lg={3} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h6 className="mb-0">2段階選択</h6>
            </Card.Header>
            <Card.Body>
              {/* プロジェクト選択 */}
              <div className="mb-4">
                <label className="form-label fw-bold">プロジェクト</label>
                <div className="text-muted small">
                  選択されたプロジェクト: {selectedProject?.name || '未選択'}
                </div>
                <div className="mt-2 p-3 bg-light rounded text-center">
                  <small className="text-muted">プロジェクト一覧（実装予定）</small>
                </div>
              </div>

              {/* タスク選択 */}
              <div className="mb-4">
                <label className="form-label fw-bold">タスク</label>
                <div className="text-muted small">
                  選択されたタスク: {selectedTask?.name || '未選択'}
                </div>
                <div className="mt-2 p-3 bg-light rounded text-center">
                  <small className="text-muted">
                    {selectedProject ? 'タスク一覧（実装予定）' : 'プロジェクトを先に選択してください'}
                  </small>
                </div>
              </div>

              {/* 分類選択 */}
              <div>
                <label className="form-label fw-bold">分類</label>
                <div className="text-muted small">
                  選択された分類: {selectedCategory?.name || '未選択'}
                </div>
                <div className="mt-2 p-3 bg-light rounded text-center">
                  <small className="text-muted">分類一覧（実装予定）</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* メインコンテンツ */}
        <Col lg={9}>
          {/* タブナビゲーション */}
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'calendar'}
                onClick={() => handleTabSelect('calendar')}
                style={{ cursor: 'pointer' }}
              >
                カレンダー
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'list'}
                onClick={() => handleTabSelect('list')}
                style={{ cursor: 'pointer' }}
              >
                リスト
              </Nav.Link>
            </Nav.Item>
          </Nav>

          {/* タブコンテンツ */}
          {renderTabContent()}
        </Col>
      </Row>
    </Container>
  );
};

export default TimeEntry;
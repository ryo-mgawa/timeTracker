import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Nav, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Project, Category, Task, TimeEntry as TimeEntryType } from 'types';
import { userService } from 'services/userService';
import TimeTrackingCalendar from 'components/Calendar';
import ProjectSelector from 'components/ProjectSelector';
import CategorySelector from 'components/CategorySelector';
import TaskSelector from 'components/TaskSelector';

// タブの種類
type TabType = 'calendar' | 'list';

const TimeEntry: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  const [selectedDate] = useState<Date>(new Date());
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // ユーザー情報を取得
  useEffect(() => {
    const fetchUser = async (): Promise<void> => {
      // アーリーリターン - userIdが無い場合
      if (!userId) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        const fetchedUser = await userService.getUserById(userId);
        setUser(fetchedUser);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'ユーザー情報の取得に失敗しました';
        setError(errorMessage);
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, navigate]);

  // ローディング表示
  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">読み込み中...</span>
          </Spinner>
          <p>ユーザー情報を読み込んでいます...</p>
        </div>
      </Container>
    );
  }

  // エラー表示
  if (error) {
    return (
      <Container>
        <Alert variant="danger">
          <Alert.Heading>エラーが発生しました</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => navigate('/')}>
            ユーザー選択に戻る
          </Button>
        </Alert>
      </Container>
    );
  }

  // アーリーリターン - ユーザーが未選択の場合
  if (!user) {
    return (
      <Container>
        <Alert variant="warning">
          <Alert.Heading>ユーザーが選択されていません</Alert.Heading>
          <p>ユーザー選択画面に戻って、ユーザーを選択してください。</p>
          <Button variant="outline-warning" onClick={() => navigate('/')}>
            ユーザー選択に戻る
          </Button>
        </Alert>
      </Container>
    );
  }

  const handleTabSelect = (tab: TabType): void => {
    setActiveTab(tab);
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
                <div className="mt-2">
                  {user && (
                    <ProjectSelector
                      user={user}
                      selectedProject={selectedProject}
                      onProjectSelect={setSelectedProject}
                    />
                  )}
                </div>
              </div>

              {/* タスク選択 */}
              <div className="mb-4">
                <label className="form-label fw-bold">タスク</label>
                <div className="text-muted small">
                  選択されたタスク: {selectedTask?.name || '未選択'}
                </div>
                <div className="mt-2">
                  <TaskSelector
                    selectedProject={selectedProject}
                    selectedTask={selectedTask}
                    onTaskSelect={setSelectedTask}
                    userId={user.id}
                  />
                </div>
              </div>

              {/* 分類選択 */}
              <div>
                <label className="form-label fw-bold">分類</label>
                <div className="text-muted small">
                  選択された分類: {selectedCategory?.name || '未選択'}
                </div>
                <div className="mt-2">
                  {user && (
                    <CategorySelector
                      user={user}
                      selectedCategory={selectedCategory}
                      onCategorySelect={setSelectedCategory}
                    />
                  )}
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
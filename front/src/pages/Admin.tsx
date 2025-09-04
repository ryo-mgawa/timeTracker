import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Nav } from 'react-bootstrap';
import { User } from '../types';
import { userService } from '../services/userService';
import ProjectCreateModal from 'components/ProjectCreateModal';
import CategoryCreateModal from 'components/CategoryCreateModal';
import TaskCreateModal from 'components/TaskCreateModal';
import UserCreateModal from 'components/UserCreateModal';
import ProjectList from 'components/ProjectList';
import CategoryList from 'components/CategoryList';
import TaskList from 'components/TaskList';
import UserList from 'components/UserList';

// タブの型定義
type AdminTab = 'projects' | 'categories' | 'tasks' | 'users';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('projects');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  // モーダル表示状態
  const [showProjectModal, setShowProjectModal] = useState<boolean>(false);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  
  // リフレッシュトリガー（作成・編集・削除後にリストを更新するため）
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // ユーザー一覧取得
  const fetchUsers = async (): Promise<void> => {
    try {
      setLoading(true);
      const usersData = await userService.getUsers();
      setUsers(usersData as User[]);
      
      // 最初のユーザーを自動選択
      if (usersData.length > 0) {
        setSelectedUserId(usersData[0].id);
      }
    } catch (error) {
      console.error('ユーザー一覧の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初期データ取得
  useEffect(() => {
    fetchUsers();
  }, []);

  // タブ切り替えハンドラー
  const handleTabSelect = (tab: AdminTab): void => {
    setActiveTab(tab);
  };

  // モーダル表示ハンドラー
  const handleShowModal = (): void => {
    // ユーザー作成の場合は選択ユーザー不要
    if (activeTab !== 'users' && !selectedUserId) {
      alert('ユーザーを選択してください');
      return;
    }

    switch (activeTab) {
      case 'projects':
        setShowProjectModal(true);
        break;
      case 'categories':
        setShowCategoryModal(true);
        break;
      case 'tasks':
        setShowTaskModal(true);
        break;
      case 'users':
        setShowUserModal(true);
        break;
    }
  };

  // 作成成功時のハンドラー
  const handleCreateSuccess = (): void => {
    // リストを更新するためのトリガーを更新
    setRefreshTrigger(prev => prev + 1);
    
    // ユーザーを作成した場合はユーザー選択も更新
    if (activeTab === 'users') {
      fetchUsers();
    }
    console.log('作成が完了しました');
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h2>管理画面</h2>
          <p className="text-muted">プロジェクト・分類・タスクの作成と管理</p>
        </Col>
      </Row>

      {/* ユーザー選択 */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <strong>ユーザー選択</strong>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div>読み込み中...</div>
              ) : (
                <div className="d-flex align-items-center">
                  <label htmlFor="userSelect" className="form-label me-3 mb-0">
                    対象ユーザー:
                  </label>
                  <select
                    id="userSelect"
                    className="form-select"
                    style={{ maxWidth: '300px' }}
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    <option value="">ユーザーを選択してください</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} {user.email && `(${user.email})`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* タブナビゲーション */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <Nav variant="tabs" defaultActiveKey="projects">
                <Nav.Item>
                  <Nav.Link
                    eventKey="projects"
                    active={activeTab === 'projects'}
                    onClick={() => handleTabSelect('projects')}
                  >
                    プロジェクト管理
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    eventKey="categories"
                    active={activeTab === 'categories'}
                    onClick={() => handleTabSelect('categories')}
                  >
                    分類管理
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    eventKey="tasks"
                    active={activeTab === 'tasks'}
                    onClick={() => handleTabSelect('tasks')}
                  >
                    タスク管理
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    eventKey="users"
                    active={activeTab === 'users'}
                    onClick={() => handleTabSelect('users')}
                  >
                    ユーザー管理
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  {activeTab === 'projects' && (
                    <>
                      <h5 className="mb-1">プロジェクト管理</h5>
                      <p className="text-muted mb-0">プロジェクトの作成・編集・削除を行います</p>
                    </>
                  )}
                  {activeTab === 'categories' && (
                    <>
                      <h5 className="mb-1">分類管理</h5>
                      <p className="text-muted mb-0">作業分類の作成・編集・削除を行います</p>
                    </>
                  )}
                  {activeTab === 'tasks' && (
                    <>
                      <h5 className="mb-1">タスク管理</h5>
                      <p className="text-muted mb-0">プロジェクト内のタスクの作成・編集・削除を行います</p>
                    </>
                  )}
                  {activeTab === 'users' && (
                    <>
                      <h5 className="mb-1">ユーザー管理</h5>
                      <p className="text-muted mb-0">システムを利用するユーザーの作成・編集・削除を行います</p>
                    </>
                  )}
                </div>
                <Button
                  variant="primary"
                  onClick={handleShowModal}
                  disabled={activeTab !== 'users' && !selectedUserId}
                >
                  <i className="fas fa-plus me-2"></i>
                  {activeTab === 'projects' && '新規プロジェクト'}
                  {activeTab === 'categories' && '新規分類'}
                  {activeTab === 'tasks' && '新規タスク'}
                  {activeTab === 'users' && '新規ユーザー'}
                </Button>
              </div>

              {/* アクティブなタブに応じたリスト表示 */}
              {activeTab === 'projects' && (
                <ProjectList
                  userId={selectedUserId}
                  onEdit={() => {/* TODO: プロジェクト編集機能 */}}
                  refreshTrigger={refreshTrigger}
                />
              )}
              {activeTab === 'categories' && (
                <CategoryList
                  userId={selectedUserId}
                  onEdit={() => {/* TODO: 分類編集機能 */}}
                  refreshTrigger={refreshTrigger}
                />
              )}
              {activeTab === 'tasks' && (
                <TaskList
                  userId={selectedUserId}
                  onEdit={() => {/* TODO: タスク編集機能 */}}
                  refreshTrigger={refreshTrigger}
                />
              )}
              {activeTab === 'users' && (
                <UserList
                  onEdit={() => {/* TODO: ユーザー編集機能 */}}
                  refreshTrigger={refreshTrigger}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* モーダル群 */}
      <ProjectCreateModal
        show={showProjectModal}
        onHide={() => setShowProjectModal(false)}
        userId={selectedUserId}
        onSuccess={handleCreateSuccess}
      />

      <CategoryCreateModal
        show={showCategoryModal}
        onHide={() => setShowCategoryModal(false)}
        userId={selectedUserId}
        onSuccess={handleCreateSuccess}
      />

      <TaskCreateModal
        show={showTaskModal}
        onHide={() => setShowTaskModal(false)}
        userId={selectedUserId}
        onSuccess={handleCreateSuccess}
      />

      <UserCreateModal
        show={showUserModal}
        onHide={() => setShowUserModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </Container>
  );
};

export default Admin;
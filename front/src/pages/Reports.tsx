import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Spinner, Alert } from 'react-bootstrap';
import { reportService, ProjectSummary, CategorySummary, DailySummary, WorkHoursDetail, ReportFilters } from '../services/reportService';
import { userService } from '../services/userService';
import { User } from '../types';

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'projects' | 'categories' | 'daily' | 'details'>('projects');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // データ状態
  const [projectSummary, setProjectSummary] = useState<ProjectSummary[]>([]);
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [dailySummary, setDailySummary] = useState<DailySummary[]>([]);
  const [workHoursDetail, setWorkHoursDetail] = useState<WorkHoursDetail[]>([]);
  
  // フィルタ状態
  const [filters, setFilters] = useState<ReportFilters>({});
  
  // ユーザー関連の状態
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [usersLoading, setUsersLoading] = useState(true);
  
  // 期間選択のショートカット
  const handlePeriodSelect = (period: 'thisMonth' | 'lastMonth' | 'last30Days') => {
    let newFilters: ReportFilters;
    switch (period) {
      case 'thisMonth':
        newFilters = reportService.getThisMonthPeriod();
        break;
      case 'lastMonth':
        newFilters = reportService.getLastMonthPeriod();
        break;
      case 'last30Days':
        newFilters = reportService.getLast30DaysPeriod();
        break;
      default:
        return;
    }
    setFilters(newFilters);
  };

  // ユーザー一覧取得
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const usersData = await userService.getUsers();
      setUsers(usersData as User[]);
      // 最初のユーザーを自動選択
      if (usersData.length > 0) {
        setSelectedUserId(usersData[0].id);
      }
    } catch (err) {
      setError('ユーザー一覧の取得に失敗しました');
      console.error('Users fetch error:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  // ユーザー選択変更ハンドラー
  const handleUserChange = (newUserId: string) => {
    setSelectedUserId(newUserId);
    // レポートデータをクリア
    setProjectSummary([]);
    setCategorySummary([]);
    setDailySummary([]);
    setWorkHoursDetail([]);
  };

  // データ取得関数
  const fetchProjectSummary = async () => {
    if (!selectedUserId) return;
    
    try {
      setLoading(true);
      const data = await reportService.getProjectSummary(selectedUserId, filters);
      setProjectSummary(data);
      setError('');
    } catch (err) {
      setError('プロジェクト別集計の取得に失敗しました');
      console.error('Project summary error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorySummary = async () => {
    if (!selectedUserId) return;
    
    try {
      setLoading(true);
      const data = await reportService.getCategorySummary(selectedUserId, filters);
      setCategorySummary(data);
      setError('');
    } catch (err) {
      setError('分類別集計の取得に失敗しました');
      console.error('Category summary error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailySummary = async () => {
    if (!selectedUserId) return;
    
    try {
      setLoading(true);
      const data = await reportService.getDailySummary(selectedUserId, filters);
      setDailySummary(data);
      setError('');
    } catch (err) {
      setError('日別集計の取得に失敗しました');
      console.error('Daily summary error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkHoursDetail = async () => {
    if (!selectedUserId) return;
    
    try {
      setLoading(true);
      const data = await reportService.getWorkHoursDetail(selectedUserId, filters);
      setWorkHoursDetail(data);
      setError('');
    } catch (err) {
      setError('工数詳細の取得に失敗しました');
      console.error('Work hours detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ユーザー一覧を初期化時に取得
  useEffect(() => {
    fetchUsers();
  }, []);

  // タブやユーザー選択が変わった時のデータ取得
  useEffect(() => {
    if (!selectedUserId) return;
    
    switch (activeTab) {
      case 'projects':
        fetchProjectSummary();
        break;
      case 'categories':
        fetchCategorySummary();
        break;
      case 'daily':
        fetchDailySummary();
        break;
      case 'details':
        fetchWorkHoursDetail();
        break;
    }
  }, [activeTab, filters, selectedUserId]);

  // フィルタ値の更新
  const handleFilterChange = (field: keyof ReportFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value || undefined
    }));
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ja-JP');
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h2>レポート・工数集計</h2>
        </Col>
      </Row>

      {/* ユーザー選択 */}
      <Row className="mb-3">
        <Col>
          <Card>
            <Card.Header>
              <strong>ユーザー選択</strong>
            </Card.Header>
            <Card.Body>
              {usersLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <Form.Select
                  value={selectedUserId}
                  onChange={(e) => handleUserChange(e.target.value)}
                  disabled={users.length === 0}
                >
                  <option value="">ユーザーを選択してください</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} {user.email && `(${user.email})`}
                    </option>
                  ))}
                </Form.Select>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 期間選択ショートカット */}
      <Row className="mb-3">
        <Col>
          <Card>
            <Card.Header>
              <strong>期間選択</strong>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={() => handlePeriodSelect('thisMonth')}
                    className="me-2 mb-2"
                  >
                    今月
                  </Button>
                </Col>
                <Col md={3}>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={() => handlePeriodSelect('lastMonth')}
                    className="me-2 mb-2"
                  >
                    先月
                  </Button>
                </Col>
                <Col md={3}>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={() => handlePeriodSelect('last30Days')}
                    className="me-2 mb-2"
                  >
                    過去30日
                  </Button>
                </Col>
              </Row>
              
              <Row className="mt-3">
                <Col md={3}>
                  <Form.Label>開始日</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  />
                </Col>
                <Col md={3}>
                  <Form.Label>終了日</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  />
                </Col>
                {activeTab === 'details' && (
                  <>
                    <Col md={3}>
                      <Form.Label>プロジェクトID</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="プロジェクトID（詳細フィルタ用）"
                        value={filters.projectId || ''}
                        onChange={(e) => handleFilterChange('projectId', e.target.value)}
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Label>分類ID</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="分類ID（詳細フィルタ用）"
                        value={filters.categoryId || ''}
                        onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                      />
                    </Col>
                  </>
                )}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* タブナビゲーション */}
      <Row className="mb-3">
        <Col>
          <Card>
            <Card.Header>
              <Button
                variant={activeTab === 'projects' ? 'primary' : 'outline-primary'}
                className="me-2"
                onClick={() => setActiveTab('projects')}
              >
                プロジェクト別集計
              </Button>
              <Button
                variant={activeTab === 'categories' ? 'primary' : 'outline-primary'}
                className="me-2"
                onClick={() => setActiveTab('categories')}
              >
                分類別集計
              </Button>
              <Button
                variant={activeTab === 'daily' ? 'primary' : 'outline-primary'}
                className="me-2"
                onClick={() => setActiveTab('daily')}
              >
                日別集計
              </Button>
              <Button
                variant={activeTab === 'details' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveTab('details')}
              >
                工数詳細
              </Button>
            </Card.Header>
          </Card>
        </Col>
      </Row>

      {/* エラー表示 */}
      {error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger">{error}</Alert>
          </Col>
        </Row>
      )}

      {/* ローディング表示 */}
      {loading && (
        <Row className="mb-3">
          <Col className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </Col>
        </Row>
      )}

      {/* データ表示エリア */}
      <Row>
        <Col>
          <Card>
            <Card.Body>
              {activeTab === 'projects' && (
                <div>
                  <h4>プロジェクト別工数集計</h4>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>プロジェクト名</th>
                        <th>エントリ数</th>
                        <th>総工数（時間）</th>
                        <th>初回作業日</th>
                        <th>最終作業日</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectSummary.map((project) => (
                        <tr key={project.projectId}>
                          <td>
                            <span
                              className="badge me-2"
                              style={{ backgroundColor: project.projectColor }}
                            >
                              {project.projectColor}
                            </span>
                            {project.projectName}
                          </td>
                          <td>{project.totalEntries}</td>
                          <td>{project.totalHours}</td>
                          <td>{project.firstWorkDate ? formatDate(project.firstWorkDate) : '-'}</td>
                          <td>{project.lastWorkDate ? formatDate(project.lastWorkDate) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {activeTab === 'categories' && (
                <div>
                  <h4>分類別工数集計</h4>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>分類名</th>
                        <th>エントリ数</th>
                        <th>総工数（時間）</th>
                        <th>初回作業日</th>
                        <th>最終作業日</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categorySummary.map((category) => (
                        <tr key={category.categoryId}>
                          <td>
                            <span
                              className="badge me-2"
                              style={{ backgroundColor: category.categoryColor }}
                            >
                              {category.categoryColor}
                            </span>
                            {category.categoryName}
                          </td>
                          <td>{category.totalEntries}</td>
                          <td>{category.totalHours}</td>
                          <td>{category.firstWorkDate ? formatDate(category.firstWorkDate) : '-'}</td>
                          <td>{category.lastWorkDate ? formatDate(category.lastWorkDate) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {activeTab === 'daily' && (
                <div>
                  <h4>日別工数集計</h4>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>日付</th>
                        <th>エントリ数</th>
                        <th>総工数（時間）</th>
                        <th>プロジェクト数</th>
                        <th>分類数</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailySummary.map((daily, index) => (
                        <tr key={index}>
                          <td>{formatDate(daily.workDate)}</td>
                          <td>{daily.totalEntries}</td>
                          <td>{daily.totalHours}</td>
                          <td>{daily.projectsCount}</td>
                          <td>{daily.categoriesCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {activeTab === 'details' && (
                <div>
                  <h4>工数詳細データ</h4>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>日付</th>
                        <th>開始時間</th>
                        <th>終了時間</th>
                        <th>工数</th>
                        <th>プロジェクト</th>
                        <th>タスク</th>
                        <th>分類</th>
                        <th>メモ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workHoursDetail.map((detail) => (
                        <tr key={detail.timeEntryId}>
                          <td>{formatDate(detail.workDate)}</td>
                          <td>{formatTime(detail.startTime)}</td>
                          <td>{formatTime(detail.endTime)}</td>
                          <td>{detail.workHours}h</td>
                          <td>
                            <span
                              className="badge me-1"
                              style={{ backgroundColor: detail.projectColor }}
                            >
                              {detail.projectColor}
                            </span>
                            {detail.projectName}
                          </td>
                          <td>{detail.taskName}</td>
                          <td>
                            <span
                              className="badge me-1"
                              style={{ backgroundColor: detail.categoryColor }}
                            >
                              {detail.categoryColor}
                            </span>
                            {detail.categoryName}
                          </td>
                          <td>{detail.memo || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Reports;
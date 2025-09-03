import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { User } from 'types';
import { userService } from 'services/userService';

interface UserSelectionProps {
  readonly onUserSelect: (user: User) => void;
}


const UserSelection: React.FC<UserSelectionProps> = ({ onUserSelect }) => {
  const [users, setUsers] = useState<readonly User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // ユーザー一覧を取得（アーリーリターンパターン適用）
  useEffect(() => {
    const fetchUsers = async (): Promise<void> => {
      try {
        setLoading(true);
        setError('');

        const fetchedUsers = await userService.getUsers();
        setUsers(fetchedUsers);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '予期しないエラーが発生しました';
        setError(errorMessage);
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // ユーザー選択ハンドラ
  const handleUserSelect = (user: User): void => {
    if (!user) return; // アーリーリターン
    
    onUserSelect(user);
  };

  // ローディング表示
  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">読み込み中...</span>
          </Spinner>
          <p>ユーザー一覧を読み込んでいます...</p>
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
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white text-center">
              <h4 className="mb-0">ユーザーを選択してください</h4>
            </Card.Header>
            <Card.Body className="p-4">
              <p className="text-muted text-center mb-4">
                工数入力を行うユーザーを選択してください
              </p>
              
              <div className="d-grid gap-3">
                {users.map((user) => (
                  <Card key={user.id} className="border">
                    <Card.Body className="d-flex justify-content-between align-items-center py-3">
                      <div>
                        <h6 className="mb-1">{user.name}</h6>
                        {user.email && (
                          <small className="text-muted">{user.email}</small>
                        )}
                      </div>
                      <Button 
                        variant="primary"
                        size="sm"
                        onClick={() => handleUserSelect(user)}
                      >
                        選択
                      </Button>
                    </Card.Body>
                  </Card>
                ))}
              </div>
              
              {users.length === 0 && (
                <Alert variant="info" className="text-center">
                  利用可能なユーザーがありません
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserSelection;
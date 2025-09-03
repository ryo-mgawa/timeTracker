import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import { AppProvider } from 'context/AppContext';
import UserSelection from 'pages/UserSelection';
import TimeEntry from 'pages/TimeEntry';
import { User } from 'types';

// アプリケーションの主要なページ状態
type AppPage = 'user-selection' | 'time-entry' | 'reports';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AppPage>('user-selection');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // アーリーリターンパターン適用
  const handleUserSelect = (user: User): void => {
    if (!user) return;
    
    setSelectedUser(user);
    setCurrentPage('time-entry');
  };

  const renderCurrentPage = (): React.ReactElement => {
    switch (currentPage) {
      case 'user-selection':
        return <UserSelection onUserSelect={handleUserSelect} />;
      
      case 'time-entry':
        if (!selectedUser) {
          setCurrentPage('user-selection');
          return <UserSelection onUserSelect={handleUserSelect} />;
        }
        return <TimeEntry user={selectedUser} />;
      
      case 'reports':
        // TODO: レポート画面の実装
        return <div>レポート画面（未実装）</div>;
      
      default:
        return <UserSelection onUserSelect={handleUserSelect} />;
    }
  };

  return (
    <AppProvider>
      <Container fluid className="min-vh-100 bg-light">
        <header className="bg-primary text-white py-3 mb-4">
          <Container>
            <h1 className="h3 mb-0">工数管理アプリケーション</h1>
            {selectedUser && (
              <small className="text-light">
                ログイン中: {selectedUser.name}
              </small>
            )}
          </Container>
        </header>
        
        <main>
          <Container>
            {renderCurrentPage()}
          </Container>
        </main>
      </Container>
    </AppProvider>
  );
};

export default App;
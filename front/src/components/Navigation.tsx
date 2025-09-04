import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();

  // アクティブなナビゲーションアイテムを判定
  const isActive = (path: string): boolean => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    return location.pathname.startsWith(path) && path !== '/';
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          工数管理アプリケーション
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              className={isActive('/') ? 'active fw-bold' : ''}
            >
              ユーザー選択
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/time-entry" 
              className={isActive('/time-entry') ? 'active fw-bold' : ''}
            >
              工数入力
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/reports" 
              className={isActive('/reports') ? 'active fw-bold' : ''}
            >
              レポート
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/admin" 
              className={isActive('/admin') ? 'active fw-bold' : ''}
            >
              管理画面
            </Nav.Link>
          </Nav>
          
          {/* ユーザー情報表示エリア（将来の機能用） */}
          <Nav className="ms-auto">
            <Navbar.Text className="text-light">
              {/* TODO: ログイン中のユーザー情報を表示 */}
            </Navbar.Text>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
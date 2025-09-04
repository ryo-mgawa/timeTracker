import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { AppProvider } from 'context/AppContext';
import UserSelection from 'pages/UserSelection';
import TimeEntry from 'pages/TimeEntry';
import Reports from 'pages/Reports';
import Admin from 'pages/Admin';
import Navigation from 'components/Navigation';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Container fluid className="min-vh-100 bg-light">
          <Navigation />
          
          <main>
            <Container>
              <Routes>
                <Route path="/" element={<UserSelection />} />
                <Route path="/time-entry/:userId" element={<TimeEntry />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Container>
          </main>
        </Container>
      </Router>
    </AppProvider>
  );
};

export default App;
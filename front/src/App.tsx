import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/login/ui';
import SignupPage from './pages/signup';
import MainPage from './pages/main/ui';
import ApiTest from './pages/ApiTest';
import EmailVerificationPage from './pages/EmailVerificationPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/main" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/api-test" element={<ApiTest />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/login/ui';
import SignupPage from './pages/signup/ui';
import Main from './pages/main/ui';
import WorkspaceCreate from './pages/workspace/create';
import './App.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/workspace/create" element={<WorkspaceCreate />} />
      </Routes>
    </Router>
  );
};

export default App; 
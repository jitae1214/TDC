import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../api/authService';

// 로그인한 사용자만 접근할 수 있는 보호된 라우트 컴포넌트
const ProtectedRoute = ({ children }) => {
    const isLoggedIn = isAuthenticated();
    
    if (!isLoggedIn) {
        // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

export default ProtectedRoute; 
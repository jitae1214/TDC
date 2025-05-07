import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUsername } from '../../api/authService';
import { getAuthToken } from '../../api/apiClient';

// 로그인한 사용자만 접근할 수 있는 보호된 라우트 컴포넌트
const ProtectedRoute = ({ children }) => {
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const location = useLocation(); // 현재 위치 정보
    
    useEffect(() => {
        const checkAuth = () => {
            const loggedIn = isAuthenticated();
            const token = getAuthToken();
            // 로컬 스토리지에서 직접 확인
            const localToken = localStorage.getItem('token');
            // 세션 스토리지에서 백업 토큰 확인
            const sessionToken = sessionStorage.getItem('token');
            const username = getUsername();
            
            // 모든 스토리지 확인
            const hasToken = token || localToken || sessionToken;
            
            console.log('보호된 라우트 확인:');
            console.log('- 현재 URL:', location.pathname);
            console.log('- 인증 함수 결과:', loggedIn);
            console.log('- getAuthToken 결과:', !!token);
            console.log('- 로컬 스토리지 토큰:', !!localToken);
            console.log('- 세션 스토리지 토큰:', !!sessionToken);
            console.log('- 사용자 이름:', username);
            
            if (hasToken) {
                console.log('사용자 인증됨');
                setAuthenticated(true);
                
                // 토큰이 한 곳에만 있으면 모든 곳에 복사하여 일관성 유지
                if (token && !localToken) {
                    localStorage.setItem('token', token);
                } else if (localToken && !token) {
                    localStorage.setItem('token', localToken);
                } else if (sessionToken && !localToken) {
                    localStorage.setItem('token', sessionToken);
                }
            } else {
                console.log('인증되지 않음');
                setAuthenticated(false);
            }
            
            setLoading(false);
        };
        
        // 초기 체크
        checkAuth();
        
        // 토큰이 없으면 짧은 지연 후 다시 체크 (토큰이 지연 저장되는 경우를 위해)
        if (!authenticated) {
            const timer = setTimeout(() => {
                console.log('토큰 재확인');
                checkAuth();
            }, 500); // 500ms 후 재시도
            
            return () => clearTimeout(timer);
        }
    }, [location]); // 위치가 변경될 때마다 인증 상태 확인
    
    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                인증 상태 확인 중...
            </div>
        );
    }
    
    if (!authenticated) {
        // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
        console.log('인증되지 않음: 로그인 페이지로 리다이렉트');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    console.log('인증됨: 보호된 컨텐츠 표시');
    return children;
};

export default ProtectedRoute; 
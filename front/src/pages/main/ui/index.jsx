import React from "react";
import { Link } from "react-router-dom";
import { isAuthenticated, getCurrentUser, logout } from "../../../api/authService";

const Main = () => {
    const isLoggedIn = isAuthenticated();
    const username = getCurrentUser();
    
    const handleLogout = () => {
        logout();
        window.location.reload(); // 페이지 새로고침으로 상태 업데이트
    };
    
    return (
        <div>
            <h1>메인 페이지</h1>
            
            {isLoggedIn ? (
                <div>
                    <p><strong>{username}</strong>님 환영합니다!</p>
                    <button onClick={handleLogout}>로그아웃</button>
                    <div>
                        <Link to="/api-test">API 테스트 페이지로 이동</Link>
                    </div>
                    <div>
                        <Link to="/profile">내 프로필 보기</Link>
                    </div>
                </div>
            ) : (
                <div>
                    <p>서비스를 이용하려면 로그인이 필요합니다.</p>
                    <div>
                        <Link to="/login">로그인</Link>
                        <span style={{ margin: '0 10px' }}>|</span>
                        <Link to="/signup">회원가입</Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Main;
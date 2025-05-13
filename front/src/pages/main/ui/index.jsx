import React from "react";
import {Link} from "react-router-dom";
import {isAuthenticated, getCurrentUser, logout} from "../../../api/authService";
import "./styles.css";

const Main = () => {
    const isLoggedIn = isAuthenticated();
    const username = getCurrentUser();

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <div className="main-container">
            {/* 헤더 */}
            <header className="main-header">
                <div className="main-header-logo">logo</div>
                <span className="main-welcome-text">{username}님 환영합니다!</span>
                <Link to="/profile" className="main-link">내 프로필</Link>
                <Link to="/workspace/create" className="main-create-btn">새 워크스페이스 개설</Link>
                <button className="main-logout-btn" onClick={handleLogout}>로그아웃</button>
            </header>

            <main className="main-content">
                <h1 className="main-title">👋 또 만나게 되어 반가워요</h1>

                <div className="main-workspace-card">
                    <div className="main-workspace-header">
                        {username}의 워크스페이스
                    </div>

                    {/* 워크스페이스 항목들 */}
                    <div className="main-workspace-item">
                        <div className="main-workspace-info">
                            <div className="main-workspace-img"/>
                            <div>
                                <div className="main-workspace-name">새 워크스페이스</div>
                                <div className="main-workspace-members">0명의 멤버</div>
                            </div>
                        </div>
                        <button className="main-launch-btn">SLACK 실행하기</button>
                    </div>

                    <div className="main-workspace-item">
                        <div className="main-workspace-info">
                            <div className="main-workspace-img"/>
                            <div>
                                <div className="main-workspace-name">TDC프로젝트</div>
                                <div className="main-workspace-members">0명의 멤버</div>
                            </div>
                        </div>
                        <button className="main-launch-btn">SLACK 실행하기</button>
                    </div>

                    <div className="main-workspace-item">
                        <div className="main-workspace-info">
                            <div className="main-workspace-img"/>
                            <div>
                                <div className="main-workspace-name">새 워크스페이스</div>
                                <div className="main-workspace-members">0명의 멤버</div>
                            </div>
                        </div>
                        <button className="main-launch-btn">SLACK 실행하기</button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Main;

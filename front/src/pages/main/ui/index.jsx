import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated, getCurrentUser, logout } from "../../../api/authService";
import { getWorkspaces } from "../../../api/workspaceService";
import "./styles.css";

const Main = () => {
    const isLoggedIn = isAuthenticated();
    const username = getCurrentUser();
    const navigate = useNavigate();
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 로그인 확인
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        // 워크스페이스 목록 가져오기
        const fetchWorkspaces = async () => {
            try {
                setLoading(true);
                const response = await getWorkspaces('all');
                setWorkspaces(response.workspaces);
                setError(null);
            } catch (err) {
                console.error('워크스페이스 목록을 가져오는데 실패했습니다:', err);
                setError('워크스페이스 목록을 가져오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchWorkspaces();
    }, [isLoggedIn, navigate]);

    const handleLaunchWorkspace = (workspaceId) => {
        // SLACK 실행 로직 구현 (예: 채팅 페이지로 이동)
        navigate(`/workspace/${workspaceId}/chat`);
    };
    
    const handleCreateWorkspace = () => {
        // 새 워크스페이스 생성 페이지로 이동
        navigate('/workspace/create');
    };

    return (
        <div className="main-container">
            {/* 헤더 */}
            <header className="main-header">
                <div className="main-header-logo">logo</div>
                <span className="main-welcome-text">{username}님 환영합니다!</span>
                <Link to="/profile" className="main-link">내 프로필</Link>
            </header>

            <main className="main-content">
                <h1 className="main-title">👋 어 그래 왔니? 내 하얼빈의 장첸이야아!!! </h1>

                <div className="main-workspace-card">
                    <div className="main-workspace-header">
                        <p>{username}의 워크스페이스</p>
                        <button onClick={handleCreateWorkspace} className="main-create-btn">새 워크스페이스 개설</button>
                    </div>

                    {loading ? (
                        <div className="main-workspace-loading">워크스페이스 로딩 중...</div>
                    ) : error ? (
                        <div className="main-workspace-error">{error}</div>
                    ) : workspaces.length === 0 ? (
                        <div className="main-workspace-empty">
                            <p>아직 워크스페이스가 없습니다.</p>
                            <button onClick={handleCreateWorkspace} className="main-create-btn">새 워크스페이스 개설하기</button>
                        </div>
                    ) : (
                        workspaces.map(workspace => (
                            <div className="main-workspace-item" key={workspace.id}>
                        <div className="main-workspace-info">
                                    <div 
                                        className="main-workspace-img" 
                                        style={{ backgroundColor: workspace.iconColor || '#e0e0e0' }}
                                    />
                            <div>
                                        <div className="main-workspace-name">{workspace.name}</div>
                                        <div className="main-workspace-members">{workspace.memberCount}명의 멤버</div>
                            </div>
                        </div>
                                <button 
                                    className="main-launch-btn"
                                    onClick={() => handleLaunchWorkspace(workspace.id)}
                                >
                                    SLACK 실행하기
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default Main;

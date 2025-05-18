import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import KakaoLoginButton from "../../../components/KakaoLoginButton";
import GoogleLoginButton from "../../../components/GoogleLoginButton";
import NaverLoginButton from "../../../components/NaverLoginButton";
import loginApi from "../api";
import "./styles.css";

// 로그인 유효성 검사용
const validateLogin = (username: string, password: string): string | null => {
    if (!username.trim()) return "아이디를 입력하세요.";
    if (!password) return "비밀번호를 입력하세요.";
    return null;
};

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateLogin(username, password);
        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        try {
            setIsLoading(true);
            setErrorMessage("");

            const response = await loginApi({ username, password });

            if (response.success) {
                // 로그인 전에 기존 데이터 정리
                clearPreviousUserData();
                
                // 확실하게 로컬 스토리지에 사용자 이름 저장
                if (response.username) {
                    localStorage.setItem('username', response.username);
                    console.log('로그인 성공: 응답에서 사용자 이름 저장됨', response.username);
                } else {
                    // 응답에 사용자 이름이 없는 경우 입력한 사용자 이름 사용
                    localStorage.setItem('username', username);
                    console.log('로그인 성공: 입력된 사용자 이름 저장됨', username);
                }
                
                navigate("/main");
            } else {
                setErrorMessage(response.message || "로그인에 실패했습니다.");
            }
        } catch (error) {
            setErrorMessage("서버 연결 중 오류가 발생했습니다.");
            console.error("로그인 오류:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 이전 사용자 데이터 정리 함수
    const clearPreviousUserData = () => {
        console.log('이전 사용자 데이터 정리 중...');
        
        // 소셜 로그인 관련 데이터
        localStorage.removeItem('profileImage');
        
        // 일반 사용자 데이터
        localStorage.removeItem('userProfileImage');
        localStorage.removeItem('userNickname');
        localStorage.removeItem('signupProfileImage');
        
        // 워크스페이스 관련 데이터
        localStorage.removeItem('currentWorkspaceId');
        
        // 사용자별 저장된 데이터 (profileImage_*, nickname_* 등)
        Object.keys(localStorage).forEach(key => {
            if (key.includes('profileImage_') || 
                key.includes('nickname_') || 
                key.includes('workspace_') ||
                key.includes('_owner') || 
                key.includes('_user') ||
                key.includes('invited_by_')) {
                console.log(`삭제: ${key}`);
                localStorage.removeItem(key);
            }
        });
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>로그인</h2>

                {errorMessage && (
                    <div className="login-error">{errorMessage}</div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div>
                        <label htmlFor="username">아이디</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="아이디를 입력하세요"
                        />
                    </div>

                    <div>
                        <label htmlFor="password">비밀번호</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호를 입력하세요"
                        />
                    </div>

                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? "로그인 중..." : "로그인"}
                    </button>
                </form>

                <div className="login-divider">또는</div>

                <KakaoLoginButton />
                <div style={{ margin: '10px 0' }}></div>
                <GoogleLoginButton />
                <div style={{ margin: '10px 0' }}></div>
                <NaverLoginButton />

                <div className="login-links" style={{ marginTop: '30px' }}>
                    <Link to="/signup">회원가입</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;

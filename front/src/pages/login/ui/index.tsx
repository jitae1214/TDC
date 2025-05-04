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
                navigate("/api-test");
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
                    <Link to="/main" style={{ marginRight: '20px' }}>메인으로</Link>
                    <Link to="/signup">회원가입</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;

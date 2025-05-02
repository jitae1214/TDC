import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../../api/authService";
import KakaoLoginButton from "../../../components/KakaoLoginButton";

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!username.trim()) {
            setErrorMessage("아이디를 입력하세요.");
            return;
        }
        
        if (!password) {
            setErrorMessage("비밀번호를 입력하세요.");
            return;
        }

        try {
            setIsLoading(true);
            setErrorMessage("");
            
            const response = await login({ username, password });
            
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
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            height: '100vh',
            padding: '20px'
        }}>
            <h2>로그인</h2>
            
            {errorMessage && <div style={{ color: 'red', marginBottom: '15px' }}>{errorMessage}</div>}
            
            <form onSubmit={handleSubmit}>
                <div>
                    <label>아이디</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                
                <div>
                    <label>비밀번호</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "로그인 중..." : "로그인"}
                </button>
            </form>

            <div style={{ margin: '20px 0' }}>또는</div>

            <KakaoLoginButton />
            
            <div style={{ marginTop: '30px' }}>
                <Link to="/main" style={{ marginRight: '20px' }}>메인으로</Link>
                <Link to="/signup">회원가입</Link>
            </div>
        </div>
    );
};

export default Login;
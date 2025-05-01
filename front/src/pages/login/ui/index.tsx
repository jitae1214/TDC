import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../../api/authService";

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 입력값 검증
        if (!username.trim()) {
            setErrorMessage("아이디를 입력해라ㅅㅂ.");
            return;
        }
        
        if (!password) {
            setErrorMessage("비밀번호를 입력해라ㅅㅂ.");
            return;
        }

        try {
            setIsLoading(true);
            setErrorMessage("");
            
            // 로그인 API 호출
            const response = await login({ username, password });
            
            if (response.success) {
                // 로그인 성공 시 API 테스트 페이지로 이동
                navigate("/api-test");
            } else {
                // 로그인 실패 시 에러 메시지 표시
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
        <div>
            <div>
                <Link to="/main">메인으로 쳐 가기</Link>
                <Link to="/signup">회원가입으로 쳐 가기</Link>
            </div>
            
            <h2>로그인인데요</h2>
            
            {errorMessage && <div>{errorMessage}</div>}
            
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
        </div>
    );
};

export default Login;
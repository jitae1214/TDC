import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { isAuthenticated } from '../api/authService';

interface TestResponse {
  message: string;
}

interface ServerInfoResponse {
  status: string;
  version: string;
  serverTime: number;
}

const ApiTest: React.FC = () => {
    const [message, setMessage] = useState<string>('');
    const [serverInfo, setServerInfo] = useState<string>('');
    const [protectedInfo, setProtectedInfo] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const isLoggedIn = isAuthenticated();

    useEffect(() => {
        const fetchBasicData = async () => {
            try {
                setLoading(true);
                // 기본 테스트 메시지 조회
                const response = await apiClient.get<TestResponse>('/test/hello');
                setMessage(response.data.message);
                setError('');
                
                // 서버 정보도 가져오기
                const infoResponse = await apiClient.get<ServerInfoResponse>('/test/info');
                setServerInfo(
                    `상태: ${infoResponse.data.status}, 버전: ${infoResponse.data.version}, 시간: ${new Date(infoResponse.data.serverTime).toLocaleString()}`
                );
            } catch (err) {
                console.error('API 호출 중 오류 발생:', err);
                setError('백엔드 서버 실행중인지 확인해 시발 백엔드 서버 참 지랄맞다 그쟈?');
            } finally {
                setLoading(false);
            }
        };

        fetchBasicData();
    }, []);
    
    // 보호된 리소스 로드
    const loadProtectedResource = async () => {
        try {
            const response = await apiClient.get<TestResponse>('/test/protected');
            setProtectedInfo(response.data.message);
        } catch (err) {
            setProtectedInfo('보호된 리소스를 가져오는데 실패');
        }
    };

    return (
        <div>
            <h1>백엔드 API 연결 테스트</h1>
            
            <div>
                <Link to="/">메인으로 돌아가기</Link>
            </div>

            <div>
                <h2>API 응답:</h2>
                
                {loading && <p>로딩 중...</p>}
                
                {!loading && error && (
                    <div>
                        <p>{error}</p>
                        <p>시발 에러</p>
                    </div>
                )}
                
                {!loading && !error && (
                    <div>
                        <p><strong>개나이스 성공!</strong> 백엔드 서버의 응답:</p>
                        <p>{message}</p>
                        
                        <h3>서버 정보:</h3>
                        <p>{serverInfo}</p>
                        
                        <h3>JWT토큰, 보호된 리소스 테스트 시바..:</h3>
                        {isLoggedIn ? (
                            <div>
                                <button onClick={loadProtectedResource}>JWT토큰 기능이다 시발,미완성</button>
                                {protectedInfo && <p>{protectedInfo}</p>}
                            </div>
                        ) : (
                            <p>보호 리소스 접근 할려면 로그인 해라.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApiTest; 
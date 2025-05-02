import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithSocialAuthCode } from '../../api/socialAuthService';

interface DebugInfo {
  code?: string;
  error?: string | null;
  errorDescription?: string | null;
  responseError?: string;
  responseStatus?: number;
  responseData?: any;
}

const KakaoCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});
  
  useEffect(() => {
    // URL에서 인증 코드 추출
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    
    console.log('카카오 콜백 파라미터:', { code, error, errorDescription });
    setDebugInfo({ code: code ? '있음' : '없음', error, errorDescription });
    
    if (error) {
      setError(`카카오 인증 오류: ${error} - ${errorDescription || '설명 없음'}`);
      setLoading(false);
      return;
    }
    
    if (!code) {
      setError('인증 코드를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }
    
    // 소셜 로그인 처리
    const handleSocialLogin = async () => {
      try {
        console.log('소셜 로그인 요청 전송 - 코드:', code);
        
        const response = await loginWithSocialAuthCode({
          code,
          provider: 'kakao',
        });
        
        console.log('소셜 로그인 응답:', response);
        
        if (response.success) {
          // 로그인 성공 시 리다이렉트
          console.log('로그인 성공, 리다이렉트 경로: /api-test');
          navigate('/api-test');
        } else {
          console.error('로그인 실패 응답:', response);
          setError(response.message || '카카오 로그인에 실패했습니다.');
          setDebugInfo(prev => ({ ...prev, responseError: response.message }));
        }
      } catch (err: any) {
        console.error('카카오 로그인 오류 상세:', err);
        let errorMsg = '서버 연결 중 오류가 발생했습니다.';
        
        if (err.response) {
          errorMsg += ` (${err.response.status}: ${JSON.stringify(err.response.data)})`;
          setDebugInfo(prev => ({ 
            ...prev, 
            responseStatus: err.response.status,
            responseData: err.response.data
          }));
        }
        
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    
    handleSocialLogin();
  }, [navigate]);
  
  if (loading) {
    return (
      <div 
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column'
        }}
      >
        <div style={{ marginBottom: '16px' }}>로그인 처리 중...</div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          인증 코드: {debugInfo.code}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div 
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column'
        }}
      >
        <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>
        <div style={{ 
          fontSize: '12px', 
          color: '#666', 
          marginBottom: '16px',
          maxWidth: '80%',
          wordBreak: 'break-all'
        }}>
          <details>
            <summary>디버깅 정보</summary>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </details>
        </div>
        <button 
          onClick={() => navigate('/login')}
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#007bff',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          로그인 페이지로 돌아가기
        </button>
      </div>
    );
  }
  
  return (
    <div style={{ 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}>
      <div>로그인 완료, 리다이렉트 중...</div>
    </div>
  );
};

export default KakaoCallback;
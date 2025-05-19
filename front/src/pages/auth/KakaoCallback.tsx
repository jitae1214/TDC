import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithSocialAuthCode } from '../../api/socialAuthService';
import apiClient, { setAuthToken } from '../../api/apiClient';

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
    
    // 코드가 없거나 에러가 있는 경우에도 로그인 페이지로 리다이렉트
    if (error || !code) {
      console.error('카카오 로그인 오류 또는 코드 없음:', error, errorDescription);
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
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
        
        // 로그인 성공 시 직접 토큰 설정 처리
        if (response.success && response.token) {
          console.log('KakaoCallback: 로그인 성공, 토큰 설정 시작');
          
          try {
            // apiClient의 setAuthToken 함수 사용
            setAuthToken(response.token);
            
            // 토큰이 올바르게 저장되었는지 확인
            const localToken = localStorage.getItem('token');
            const sessionToken = sessionStorage.getItem('token');
            console.log('토큰 저장 확인:', {
              localStorageToken: !!localToken,
              sessionStorageToken: !!sessionToken
            });
            
            // 사용자 이름 저장
            if (response.username) {
              console.log('사용자 이름 저장:', response.username);
              localStorage.setItem('username', response.username);
              
              // 사용자 상태를 ONLINE으로 설정
              try {
                console.log('사용자 상태 ONLINE으로 설정 시도:', response.username);
                const statusResponse = await apiClient.post('/api/users/status', { 
                  username: response.username, 
                  status: 'ONLINE' 
                });
                console.log('사용자 상태 업데이트 응답:', statusResponse.data);
                console.log(`카카오 로그인: 사용자 ${response.username} 상태를 ONLINE으로 변경했습니다.`);
              } catch (statusError) {
                console.error('카카오 로그인 후 사용자 상태 업데이트 오류:', statusError);
              }
            }

            // 프로필 이미지 URL 저장
            if (response.profileImage) {
              localStorage.setItem('profileImage', response.profileImage);
            }
          } catch (storageError) {
            console.error('토큰/사용자 정보 저장 중 오류:', storageError);
          }
        } else {
          console.error('소셜 로그인 실패:', response.message);
        }
        
        // 로그인 처리 완료, 페이지 이동 준비
        console.log('로그인 처리 완료, 지정된 페이지로 이동 준비');
        
        // 토큰 저장 후 짧은 지연 시간을 두고 리다이렉트
        setTimeout(() => {
          const redirectUrl = response.redirectUrl || '/main';
          console.log('리다이렉트 URL:', redirectUrl);
          window.location.href = redirectUrl;
        }, 1000);
      } catch (err: any) {
        // 오류가 발생해도 로그인 페이지로 리다이렉트
        console.error('카카오 로그인 처리 중 오류:', err);
        setTimeout(() => {
          window.location.href = '/main';
        }, 1000);
      } finally {
        setLoading(false);
      }
    };
    
    handleSocialLogin();
  }, [navigate]);
  
  // 로딩 중 화면 - 모든 경우에 이 화면만 표시
  return (
    <div 
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
        textAlign: 'center',
        maxWidth: '400px' 
      }}>
        <div style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          marginBottom: '16px',
          color: '#333'
        }}>
          로그인 처리 중...
        </div>
        <div style={{ 
          fontSize: '14px', 
          color: '#666', 
          marginBottom: '20px' 
        }}>
          잠시만 기다려주세요. 자동으로 메인 페이지로 이동합니다.
        </div>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #3498db',
          borderRadius: '50%',
          margin: '0 auto',
          animation: 'spin 1s linear infinite'
        }} />
        <style>
          {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          `}
        </style>
      </div>
    </div>
  );
};

export default KakaoCallback;
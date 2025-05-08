import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithSocialAuthCode } from '../../api/socialAuthService';

interface DebugInfo {
  code?: string;
  responseError?: string;
  responseStatus?: number;
  responseData?: any;
}

const GoogleCallback: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});

  useEffect(() => {
    const processGoogleLogin = async () => {
      // URL에서 인증 코드 추출
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      console.log('구글 콜백 파라미터:', { code: code ? '있음' : '없음' });
      setDebugInfo({ code: code ? '있음' : '없음' });
      
      // 코드가 없는 경우에도 로그인 페이지로 리다이렉트
      if (!code) {
        console.error('구글 로그인 인증 코드 없음');
        setTimeout(() => {
          window.location.href = '/login';
        }, 500);
        return;
      }

      try {
        console.log('소셜 로그인 요청 전송 - 코드:', code);
        
        // 백엔드 API 호출
        const response = await loginWithSocialAuthCode({
          code: code,
          provider: 'google'
        });

        // 상세 로그 추가
        console.log('구글 로그인 응답 전체 내용:', JSON.stringify(response, null, 2));
        console.log('응답에 프로필 이미지 포함 여부:', !!response.profileImage);
        
        // 로그인 성공 여부와 관계없이 항상 토큰 저장 시도 및 리다이렉트
        console.log('구글 로그인 처리 완료:', response);
        
        // 로그인 시 이전 소셜 로그인 프로필 이미지 제거 (중요)
        localStorage.removeItem('profileImage');
        
        // 토큰이 있으면 저장
        if (response.success && response.token) {
          localStorage.setItem('token', response.token);
          sessionStorage.setItem('token', response.token);
          
          if (response.username) {
            localStorage.setItem('username', response.username);
          }
          
          // 프로필 이미지 URL 저장
          if (response.profileImage) {
            localStorage.setItem('profileImage', response.profileImage);
            console.log('구글 프로필 이미지 저장:', response.profileImage);
          } else {
            console.log('구글 프로필 이미지가 응답에 없습니다.');
          }
        }
        
        // 토큰 저장 확인
        console.log('토큰 저장 상태:', {
          localStorage: !!localStorage.getItem('token'),
          sessionStorage: !!sessionStorage.getItem('token'),
          profileImage: localStorage.getItem('profileImage')
        });
        
        // 토큰 저장 후 짧은 지연 시간을 두고 리다이렉트
        setTimeout(() => {
          const redirectUrl = response.redirectUrl || '/main';
          console.log('리다이렉트 URL:', redirectUrl);
          window.location.href = redirectUrl;
        }, 1000);
      } catch (err: any) {
        // 오류가 발생해도 메인 페이지로 리다이렉트
        console.error('구글 로그인 처리 중 오류:', err);
        setTimeout(() => {
          window.location.href = '/main';
        }, 1000);
      } finally {
        setLoading(false);
      }
    };

    processGoogleLogin();
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
          구글 로그인 처리 중...
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

export default GoogleCallback; 
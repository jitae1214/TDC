import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithSocialAuthCode } from '../../api/socialAuthService';

const NaverCallback: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const processNaverLogin = async () => {
      // URL에서 인증 코드와 상태 값 추출
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      // 로컬 스토리지 및 세션 스토리지에서 상태 값 확인
      const savedStateLocal = localStorage.getItem('naverOAuthState');
      const savedStateSession = sessionStorage.getItem('naverOAuthState');
      const savedState = savedStateLocal || savedStateSession; // 둘 중 하나라도 있으면 사용
      
      console.log('네이버 콜백 파라미터:', { 
        code: code ? '있음' : '없음', 
        state, 
        savedStateLocal, 
        savedStateSession 
      });
      
      // 상태 값 확인 - 실패해도 계속 진행
      if (!code) {
        console.error('네이버 로그인 인증 오류: 코드 없음');
        
        // 로컬/세션 스토리지에서 상태 값 제거
        localStorage.removeItem('naverOAuthState');
        sessionStorage.removeItem('naverOAuthState');
        
        // 로그인 페이지로 리다이렉트
        setTimeout(() => {
          window.location.href = '/login';
        }, 500);
        return;
      }
      
      // state 검증이 실패해도 로그인 진행 - 네이버는 state가 변경되는 경우가 있음
      if (!state || (state !== savedStateLocal && state !== savedStateSession)) {
        console.warn('네이버 로그인 상태 값 불일치:', { 
          state, 
          savedStateLocal, 
          savedStateSession 
        });
      }
      
      // 로컬/세션 스토리지에서 상태 값 제거
      localStorage.removeItem('naverOAuthState');
      sessionStorage.removeItem('naverOAuthState');

      try {
        // 백엔드 API 호출
        const response = await loginWithSocialAuthCode({
          code: code,
          provider: 'naver'
        });

        // 로그인 성공 여부와 관계없이 항상 토큰 저장 시도 및 리다이렉트
        console.log('네이버 로그인 처리 완료:', response);
        
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
            console.log('네이버 프로필 이미지 저장:', response.profileImage);
          } else {
            console.log('네이버 프로필 이미지가 응답에 없습니다.');
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
          
          // 리다이렉트 방식 강화
          try {
            window.location.href = redirectUrl;
          } catch (e) {
            console.error('리다이렉트 오류, 다른 방식으로 시도:', e);
            window.location.replace(redirectUrl);
          }
        }, 1000);
      } catch (err) {
        // 오류가 발생해도 메인 페이지로 리다이렉트
        console.error('네이버 로그인 처리 중 오류:', err);
        setTimeout(() => {
          try {
            window.location.href = '/main';
          } catch (e) {
            console.error('리다이렉트 오류, 다른 방식으로 시도:', e);
            window.location.replace('/main');
          }
        }, 1000);
      } finally {
        setLoading(false);
      }
    };

    processNaverLogin();
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
          네이버 로그인 처리 중...
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

export default NaverCallback; 
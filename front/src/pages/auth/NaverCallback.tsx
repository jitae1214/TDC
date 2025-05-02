import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithSocialAuthCode } from '../../api/socialAuthService';

const NaverCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const processNaverLogin = async () => {
      // URL에서 인증 코드와 상태 값 추출
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const savedState = localStorage.getItem('naverOAuthState');
      
      // 상태 값 확인 (CSRF 방지)
      if (!state || state !== savedState) {
        setError('인증 상태 값이 일치하지 않습니다. 보안상의 이유로 로그인이 취소되었습니다.');
        setLoading(false);
        return;
      }
      
      // 로컬 스토리지에서 상태 값 제거
      localStorage.removeItem('naverOAuthState');
      
      if (!code) {
        setError('인증 코드가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        // 백엔드 API 호출
        const response = await loginWithSocialAuthCode({
          code: code,
          provider: 'naver'
        });

        if (response.success) {
          navigate('/api-test'); // 로그인 성공 시 리디렉션
        } else {
          setError(response.message || '로그인 실패');
        }
      } catch (err) {
        setError('서버 연결 중 오류가 발생했습니다.');
        console.error('네이버 로그인 처리 중 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    processNaverLogin();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>네이버 로그인 처리 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button 
          onClick={() => navigate('/login')}
          style={{ marginTop: '20px' }}
        >
          로그인 페이지로 돌아가기
        </button>
      </div>
    );
  }

  return null;
};

export default NaverCallback; 
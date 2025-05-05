import React, { useState } from 'react';
import { getGoogleLoginUrl } from '../api/socialAuthService';

interface GoogleLoginButtonProps {
  className?: string;
  buttonText?: string;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  className = '',
  buttonText = '구글로 로그인'
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const url = await getGoogleLoginUrl();
      if (url) {
        window.location.href = url;
      } else {
        console.error('구글 로그인 URL을 가져오는 데 실패했습니다.');
      }
    } catch (error) {
      console.error('구글 로그인 처리 중 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className={`google-login-btn ${className}`}
      style={{
        backgroundColor: '#ffffff',
        color: '#757575',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '10px 16px',
        cursor: isLoading ? 'wait' : 'pointer',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        width: '100%',
        opacity: isLoading ? 0.7 : 1,
      }}
    >
      {/* 구글 아이콘 */}
      <span
        style={{
          marginRight: '8px',
          display: 'inline-block',
          width: '18px',
          height: '18px',
        }}
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <g>
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </g>
        </svg>
      </span>
      {isLoading ? '로딩 중...' : buttonText}
    </button>
  );
};

export default GoogleLoginButton; 
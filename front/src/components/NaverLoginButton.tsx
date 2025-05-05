import React, { useState } from 'react';
import { getNaverLoginUrl } from '../api/socialAuthService';

interface NaverLoginButtonProps {
  className?: string;
  buttonText?: string;
}

const NaverLoginButton: React.FC<NaverLoginButtonProps> = ({
  className = '',
  buttonText = '네이버로 로그인'
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleNaverLogin = async () => {
    try {
      setIsLoading(true);
      const url = await getNaverLoginUrl();
      if (url) {
        window.location.href = url;
      } else {
        console.error('네이버 로그인 URL을 가져오는 데 실패했습니다.');
      }
    } catch (error) {
      console.error('네이버 로그인 처리 중 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleNaverLogin}
      disabled={isLoading}
      className={`naver-login-btn ${className}`}
      style={{
        backgroundColor: '#03C75A',
        color: '#ffffff',
        border: 'none',
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
      {/* 네이버 아이콘 */}
      <span
        style={{
          marginRight: '8px',
          display: 'inline-block',
          width: '18px',
          height: '18px',
        }}
      >
        <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M12.828 4.444H15.9V15.556H12.828V10.433L7.172 15.556H4.1V4.444H7.172V9.567L12.828 4.444Z" 
            fill="white" 
          />
        </svg>
      </span>
      {isLoading ? '로딩 중...' : buttonText}
    </button>
  );
};

export default NaverLoginButton; 
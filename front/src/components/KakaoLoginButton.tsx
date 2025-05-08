import React, { useState } from 'react';
import { getKakaoLoginUrl } from '../api/socialAuthService';

interface KakaoLoginButtonProps {
  className?: string;
  buttonText?: string;
}

const KakaoLoginButton: React.FC<KakaoLoginButtonProps> = ({
  className = '',
  buttonText = '카카오로 로그인'
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // 카카오 로그인 페이지로 이동
  const handleKakaoLogin = async () => {
    try {
      setIsLoading(true);
      const url = await getKakaoLoginUrl();
      if (url) {
        window.location.href = url;
      } else {
        console.error('카카오 로그인 URL을 가져오는 데 실패했습니다.');
      }
    } catch (error) {
      console.error('카카오 로그인 처리 중 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleKakaoLogin}
      disabled={isLoading}
      className={`kakao-login-btn ${className}`}
      style={{
        backgroundColor: '#FEE500',
        color: '#000000',
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
      {/* 카카오 아이콘 */}
      <span
        style={{
          marginRight: '8px',
          display: 'inline-block',
          width: '18px',
          height: '18px',
        }}
      >
        <svg viewBox="0 0 24 22" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 0C5.372 0 0 4.25 0 9.482c0 3.324 2.214 6.24 5.54 7.863l-1.413 5.217c-.125.462.432.782.803.567l6.013-4.036C11.29 19.148 11.642 19.18 12 19.18c6.628 0 12-4.338 12-9.698C24 4.25 18.628 0 12 0z"
            fill="#000000"
          />
        </svg>
      </span>
      {isLoading ? '로딩 중...' : buttonText}
    </button>
  );
};

export default KakaoLoginButton; 
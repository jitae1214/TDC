import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './EmailVerification.css';

// API 기본 URL 설정
const BASE_URL = 'http://localhost:8080/api';

interface EmailVerificationProps {
  onSuccess?: () => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' | 'info' } | null>(null);
  const [codeRequested, setCodeRequested] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // URL 파라미터에서 이메일 가져오기
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);

  // 인증 코드 요청
  const requestVerificationCode = async () => {
    if (!email.trim()) {
      setMessage({ text: '이메일을 입력해주세요.', type: 'error' });
      return;
    }

    try {
      setIsLoading(true);
      setMessage({ text: '인증 코드 발송 중...', type: 'info' });

      const response = await axios.post(`${BASE_URL}/auth/resend-verification`, { email });

      if (response.data.success) {
        setMessage({ text: '인증 코드가 이메일로 발송되었습니다.', type: 'success' });
        setCodeRequested(true);
      } else {
        setMessage({ text: response.data.message || '인증 코드 발송 실패', type: 'error' });
      }
    } catch (error) {
      console.error('인증 코드 요청 오류:', error);
      setMessage({ text: '서버 연결 중 오류가 발생했습니다.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // 인증 코드 확인
  const verifyCode = async () => {
    if (!email.trim() || !verificationCode.trim()) {
      setMessage({ text: '이메일과 인증 코드를 모두 입력해주세요.', type: 'error' });
      return;
    }

    try {
      setIsLoading(true);
      setMessage({ text: '인증 확인 중...', type: 'info' });

      const response = await axios.post(`${BASE_URL}/auth/verify-code`, {
        email,
        verificationCode
      });

      if (response.data.success) {
        setMessage({ text: '이메일 인증이 완료되었습니다.', type: 'success' });
        // 성공 콜백이 있으면 호출
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1500);
        } else {
          // 메인 페이지 또는 로그인 페이지로 이동
          setTimeout(() => {
            navigate('/login', { state: { verified: true } });
          }, 1500);
        }
      } else {
        setMessage({ text: response.data.message || '인증 실패', type: 'error' });
      }
    } catch (error) {
      console.error('인증 코드 확인 오류:', error);
      setMessage({ text: '서버 연결 중 오류가 발생했습니다.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="email-verification-container">
      <h2>이메일 인증</h2>
      <p>가입 시 입력한 이메일로 인증 코드가 발송됩니다.</p>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="verification-form">
        <div className="input-group">
          <label htmlFor="email">이메일</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 주소를 입력하세요"
            disabled={codeRequested || isLoading}
          />
        </div>

        {!codeRequested ? (
          <button 
            className="request-button" 
            onClick={requestVerificationCode} 
            disabled={isLoading}
          >
            {isLoading ? '처리 중...' : '인증코드발송하기'}
          </button>
        ) : (
          <>
            <div className="input-group">
              <label htmlFor="verificationCode">인증 코드</label>
              <input
                id="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="이메일로 받은 6자리 코드 입력"
                disabled={isLoading}
              />
            </div>
            <button 
              className="verify-button" 
              onClick={verifyCode} 
              disabled={isLoading}
            >
              {isLoading ? '처리 중...' : '인증 확인'}
            </button>
            <button 
              className="resend-button" 
              onClick={() => {
                setCodeRequested(false);
                requestVerificationCode();
              }} 
              disabled={isLoading}
            >
              코드 재발송
            </button>
          </>
        )}
      </div>
      
      <div className="verification-links">
        <a href="/login">로그인으로 돌아가기</a>
      </div>
    </div>
  );
};

export default EmailVerification; 
import apiClient, { setAuthToken } from './apiClient';
import { setUsername } from './authService';

// 소셜 로그인 제공자 타입
export type SocialProvider = 'kakao' | 'naver' | 'google';

// 카카오 인증 관련 상수
const KAKAO_CLIENT_ID = '7a8ccc15d52d94a934242f9807ffe8ff';
const KAKAO_REDIRECT_URI = `${window.location.origin}/auth/kakao/callback`;
const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;

// 소셜 로그인 응답 인터페이스
export interface SocialLoginResponse {
  success: boolean;
  message: string;
  token?: string;
  username?: string;
  socialId?: string;
  provider?: SocialProvider;
}

// 소셜 인증 코드 요청 파라미터
export interface SocialAuthCodeParams {
  code: string;
  provider: SocialProvider;
}

/**
 * 카카오 로그인 링크 반환
 */
export const getKakaoLoginUrl = (): string => {
  console.log('카카오 로그인 URL:', KAKAO_AUTH_URL);
  console.log('리디렉션 URI:', KAKAO_REDIRECT_URI);
  return KAKAO_AUTH_URL;
};

/**
 * 소셜 인증 코드를 백엔드로 전송하여 로그인 처리
 */
export const loginWithSocialAuthCode = async (
  params: SocialAuthCodeParams
): Promise<SocialLoginResponse> => {
  try {
    console.log('소셜 로그인 요청 파라미터:', JSON.stringify(params));
    console.log('API 요청 URL:', `${apiClient.defaults.baseURL}/auth/social-login`);
    
    const response = await apiClient.post<SocialLoginResponse>(
      '/auth/social-login',
      params
    );
    
    console.log('소셜 로그인 응답 상태:', response.status);
    console.log('소셜 로그인 응답 데이터:', JSON.stringify(response.data));
    
    // 로그인 성공 시 토큰과 사용자 이름 저장
    if (response.data.success && response.data.token) {
      setAuthToken(response.data.token);
      if (response.data.username) {
        setUsername(response.data.username);
      }
      console.log('소셜 로그인 성공: 토큰 및 사용자 정보 저장 완료');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('소셜 로그인 오류:', error);
    if (error.response) {
      console.error('오류 응답 상태:', error.response.status);
      console.error('오류 응답 데이터:', JSON.stringify(error.response.data));
    } else if (error.request) {
      console.error('응답 없음:', error.request);
    } else {
      console.error('요청 설정 오류:', error.message);
    }
    
    return {
      success: false,
      message: '서버 연결 중 오류가 발생했습니다.'
    };
  }
};

// 카카오 로그인 상태 확인
export const checkKakaoLoginStatus = (): boolean => {
  // 브라우저에서 실행 중인지 확인
  if (typeof window === 'undefined') return false;
  
  // URL에서 인증 코드 확인
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  
  console.log('카카오 인증 코드 확인:', code ? '코드 존재' : '코드 없음');
  
  return Boolean(code);
}; 
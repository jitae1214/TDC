import apiClient, { setAuthToken } from './apiClient';
import { setUsername } from './authService';

// 소셜 로그인 제공자 타입
export type SocialProvider = 'kakao' | 'naver' | 'google';

// 카카오 인증 관련 상수
const KAKAO_CLIENT_ID = '7a8ccc15d52d94a934242f9807ffe8ff';
const KAKAO_REDIRECT_URI = `${window.location.origin}/auth/kakao/callback`;
const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;

// 구글 인증 관련 상수
const GOOGLE_AUTH_URL_BASE = 'https://accounts.google.com/o/oauth2/v2/auth';

// 네이버 인증 관련 상수
const NAVER_AUTH_URL_BASE = 'https://nid.naver.com/oauth2.0/authorize';

// 소셜 로그인 응답 인터페이스
export interface SocialLoginResponse {
  success: boolean;
  message: string;
  token?: string;
  username?: string;
  socialId?: string;
  provider?: SocialProvider;
  redirectUrl?: string;
  profileImage?: string;
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
  return KAKAO_AUTH_URL;
};

/**
 * 구글 로그인 URL 생성
 */
export const getGoogleLoginUrl = async (): Promise<string> => {
  try {
    // 백엔드에서 클라이언트 ID와 리디렉션 URI 가져오기
    const response = await apiClient.get('/auth/google-info');
    const { clientId, redirectUri } = response.data;
    
    // 구글 로그인 URL 생성
    const googleParams = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'email profile',
      access_type: 'offline',
      prompt: 'consent'
    });
    
    return `${GOOGLE_AUTH_URL_BASE}?${googleParams.toString()}`;
  } catch (error) {
    console.error('구글 로그인 URL 생성 중 오류 발생:', error);
    return '';
  }
};

/**
 * 네이버 로그인 URL 생성
 */
export const getNaverLoginUrl = async (): Promise<string> => {
  try {
    // 백엔드에서 클라이언트 ID와 리디렉션 URI 가져오기
    const response = await apiClient.get('/auth/naver-info');
    const { clientId, redirectUri } = response.data;
    
    // 무작위 상태 값 생성 (CSRF 방지) - 더 강화된 방식
    const randomState = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // 상태값을 로컬스토리지에 저장
    localStorage.removeItem('naverOAuthState'); // 기존 값 제거
    localStorage.setItem('naverOAuthState', randomState);
    
    // 세션 스토리지에도 중복 저장 (안전성 강화)
    sessionStorage.setItem('naverOAuthState', randomState);
    
    console.log('네이버 로그인 상태값 생성:', randomState);
    
    // 네이버 로그인 URL 생성
    const naverParams = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      state: randomState
    });
    
    return `${NAVER_AUTH_URL_BASE}?${naverParams.toString()}`;
  } catch (error) {
    console.error('네이버 로그인 URL 생성 중 오류 발생:', error);
    return '';
  }
};

/**
 * 소셜 인증 코드를 백엔드로 전송하여 로그인 처리
 */
export const loginWithSocialAuthCode = async (
  params: SocialAuthCodeParams
): Promise<SocialLoginResponse> => {
  try {
    console.log('소셜 로그인 요청 시작:', params.provider);
    
    const response = await apiClient.post<SocialLoginResponse>(
      '/auth/social-login',
      params
    );
    
    console.log('소셜 로그인 응답:', response.data);
    
    // 로그인 성공 시 토큰과 사용자 이름 저장
    if (response.data.success && response.data.token) {
      console.log('토큰 저장 시작:', !!response.data.token);
      
      // 기존 토큰 제거 후 새 토큰 저장 (토큰 충돌 방지)
      localStorage.removeItem('token');
      
      // 로컬 스토리지에 직접 저장
      localStorage.setItem('token', response.data.token);
      
      // 백업으로 세션 스토리지에도 저장
      sessionStorage.setItem('token', response.data.token);
      
      // setAuthToken을 통해서도 저장 (기존 방식)
      setAuthToken(response.data.token);
      
      // 토큰이 제대로 저장되었는지 확인
      const savedToken = localStorage.getItem('token');
      console.log('저장된 토큰 확인:', !!savedToken);
      
      if (!savedToken) {
        console.error('토큰 저장 실패. 마지막 시도로 다시 저장합니다.');
        localStorage.setItem('token', response.data.token);
      }
      
      if (response.data.username) {
        console.log('사용자 이름 저장:', response.data.username);
        localStorage.setItem('username', response.data.username);
        setUsername(response.data.username);
      }
    } else {
      console.log('소셜 로그인 실패:', response.data.message);
    }
    
    return response.data;
  } catch (error: any) {
    console.error('소셜 로그인 중 에러 발생:', error);
    return {
      success: false,
      message: '서버 연결 중 오류 발생'
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
  
  return Boolean(code);
}; 
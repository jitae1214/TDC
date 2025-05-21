import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// API 기본 URL 설정
const BASE_URL = 'http://localhost:8080';  // '/api' 부분 제거
// 토큰 저장 관련 상수
const AUTH_TOKEN_KEY = 'token';

// axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 요청 타임아웃: 10초
});

// 요청 인터셉터 - 모든 요청에 JWT 토큰 자동 추가
apiClient.interceptors.request.use( 
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken(); // 개선된 함수 사용
    console.log('[상세 디버깅] API 요청 정보:', { 
      url: config.url, 
      method: config.method, 
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 15) + '...' : 'null',
    });
    
    if (token && config.headers) { // 토큰이 있고 헤더가 있으면
      config.headers.Authorization = `Bearer ${token}`; // 헤더에 토큰 추가
      console.log('Authorization 헤더 설정됨');
    } else {
      console.log('토큰이 없거나 헤더가 없어 Authorization 설정 실패');
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('API 요청 인터셉터 오류:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // 서버에서 응답이 왔지만 오류가 발생한 경우
      switch (error.response.status) {
        case 401: // Unauthorized 에러 처리 (토큰 만료 등)
          console.error('인증 오류 (401): 토큰이 유효하지 않거나 만료되었습니다.');
          // 로컬 스토리지에서 인증 정보 제거
          localStorage.removeItem(AUTH_TOKEN_KEY);
          sessionStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem('username');
          localStorage.removeItem('userId');
          
          // 로그인 페이지로 리다이렉트
          window.location.href = '/login';
          break;
          
        case 403: // Forbidden 에러 처리
          console.error('접근 권한이 없습니다.', {
            url: error.config?.url,
            method: error.config?.method,
            params: error.config?.params,
            // 토큰 정보 로깅 (보안상 앞부분만)
            token: localStorage.getItem(AUTH_TOKEN_KEY) ? '존재함 (일부 표시): ' + 
              localStorage.getItem(AUTH_TOKEN_KEY)?.substring(0, 20) + '...' : '없음',
            userId: localStorage.getItem('userId'),
            error: error.response
          });
          // 403 에러는 임시로 무시하고 진행 (UI 계속 표시)
          break;
          
        case 404: // Not Found 에러 처리
          console.error('요청한 리소스를 찾을 수 없습니다.');
          break;
          
        case 500: // 서버 에러 처리
          console.error('서버 내부 오류가 발생했습니다.');
          break;
          
        default:
          console.error(`에러 응답: ${error.response.status}`);
          break;
      }
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      console.error('서버로부터 응답이 없습니다.');
    } else {
      // 요청 설정 과정에서 오류가 발생한 경우
      console.error('요청 중 오류가 발생했습니다:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API 클라이언트 확장 기능들
// 토큰 저장 함수
export const setAuthToken = (token: string | null): void => {
  console.log('토큰 저장 시도:', !!token);
  
  if (token) { // 토큰이 있으면 로컬스토리지와 세션스토리지에 저장
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      sessionStorage.setItem(AUTH_TOKEN_KEY, token);
      console.log('토큰 저장 성공');
    } catch (error) {
      console.error('토큰 저장 중 오류 발생:', error);
    }
  } else {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      console.log('토큰 제거 완료');
    } catch (error) {
      console.error('토큰 제거 중 오류 발생:', error);
    }
  }
};

// 토큰 조회 함수 - 로컬스토리지와 세션스토리지를 모두 확인
export const getAuthToken = (): string | null => {
  try {
    // 먼저 로컬 스토리지에서 조회
    let token = localStorage.getItem(AUTH_TOKEN_KEY);
    
    // 로컬 스토리지에 없으면 세션 스토리지 확인
    if (!token) {
      token = sessionStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        console.log('세션 스토리지에서 토큰 발견, 로컬 스토리지에 복사합니다.');
        localStorage.setItem(AUTH_TOKEN_KEY, token); // 다음 요청을 위해 로컬 스토리지에도 저장
      }
    }
    
    console.log('getAuthToken 상태:', !!token);
    
    // 토큰이 비어있거나 undefined, null, 'undefined' 문자열인 경우 처리
    if (!token || token === 'undefined' || token === 'null') {
      console.log('유효하지 않은 토큰이 발견되어 제거합니다');
      localStorage.removeItem(AUTH_TOKEN_KEY);
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('토큰 조회 중 오류 발생:', error);
    return null;
  }
};

export default apiClient; 
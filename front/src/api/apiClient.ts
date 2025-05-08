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
    const token = localStorage.getItem(AUTH_TOKEN_KEY); // 로컬스토리지에 저장된 토큰 조회
    
    if (token && config.headers) { // 토큰이 있고 헤더가 있으면
      config.headers.Authorization = `Bearer ${token}`; // 헤더에 토큰 추가
    }
    
    return config;
  },
  (error: AxiosError) => {
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
          // 로컬 스토리지에서 인증 정보 제거
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem('username');
          
          // 로그인 페이지로 리다이렉트
          window.location.href = '/login';
          break;
          
        case 403: // Forbidden 에러 처리
          console.error('접근 권한이 없습니다.');
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
//토큰 저장 함수
export const setAuthToken = (token: string | null): void => {
  if (token) { // 토큰이 있으면 로컬스토리지에 저장
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
};

// 토큰 조회 함수
export const getAuthToken = (): string | null => { // 로컬스토리지에 저장된 토큰 조회
  return localStorage.getItem(AUTH_TOKEN_KEY); // 토큰이 없으면 null 반환
};

export default apiClient; 
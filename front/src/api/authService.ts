import apiClient, { setAuthToken, getAuthToken } from './apiClient';

// 상수 정의
// 엔드포인트 경로나 키 이름 변경 되어야 할 때 상수 정의 부분만 고치면 됨
const AUTH_URL = '/auth';
const AUTH_USERNAME_KEY = 'username';

/* -- Request : 프론트엔드에서 뱍엔드로 데이터를 보낼 때 사용 */
/*-- Response : 백엔드에서 프론트엔드로 응답 할 때 사용 */

// 로그인 요청 인터페이스
export interface LoginRequest {
  username: string;
  password: string;
}

// 로그인 응답 인터페이스
export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  username?: string;
}

// 회원가입 요청 인터페이스
export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  nickname?: string;
  agreeToTerms: boolean;
}

// 회원가입 응답 인터페이스
export interface RegisterResponse {
  success: boolean;
  message: string;
  username?: string;
  email?: string;
}

// 아이디 중복 확인 요청 인터페이스
export interface UsernameAvailabilityRequest {
  username: string;
}

// 이메일 중복 확인 요청 인터페이스
export interface EmailAvailabilityRequest {
  email: string;
}

// 중복 확인 응답 인터페이스
export interface AvailabilityResponse {
  available: boolean;
  message: string;
}

// 사용자 이름 관리 함수
// seUsername , getUsername는 백엔드에서 받은 사용자 이름을
// 로컬스토리지에 저장하고 관리하는 헬퍼 함수
export const setUsername = (username: string): void => {
  localStorage.setItem(AUTH_USERNAME_KEY, username);
};

export const getUsername = (): string | null => {
  return localStorage.getItem(AUTH_USERNAME_KEY);
};

// 로그인 API 호출
export const login = async (loginData: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>(`${AUTH_URL}/login`, loginData);
    
    // 로그인 성공 시 토큰과 사용자 이름 저장
    if (response.data.success && response.data.token) {
      setAuthToken(response.data.token); // JWT 토큰 저장
      setUsername(response.data.username || ''); // 사용자 이름 저장
    }
    
    return response.data;
  } catch (error) {
    console.error('로그인 오류:', error);
    return {
      success: false,
      message: '서버 연결 중 오류'
    };
  }
};

// 회원가입 API 호출
export const register = async (registerData: RegisterRequest): Promise<RegisterResponse> => {
  try {
    const response = await apiClient.post<RegisterResponse>(`${AUTH_URL}/register`, registerData);
    return response.data;
  } catch (error) {
    console.error('회원가입 오류:', error);
    return {
      success: false,
      message: '서버 연결 중 오류'
    };
  }
};

// 아이디 중복 확인 API 호출
export const checkUsernameAvailability = async (username: string): Promise<AvailabilityResponse> => {
  try {
    const response = await apiClient.post<AvailabilityResponse>(
      `${AUTH_URL}/check-username`, 
      { username }
    );
    return response.data;
  } catch (error) {
    console.error('아이디 중복 확인 오류:', error);
    return {
      available: false,
      message: '서버 연결 중 오류가 발생했습니다.'
    };
  }
};

// 이메일 중복 확인 API 호출
export const checkEmailAvailability = async (email: string): Promise<AvailabilityResponse> => {
  try {
    const response = await apiClient.post<AvailabilityResponse>(
      `${AUTH_URL}/check-email`, 
      { email }
    );
    return response.data;
  } catch (error) {
    console.error('이메일 중복 확인 오류:', error);
    return {
      available: false,
      message: '서버 연결 중 오류가 발생했습니다.'
    };
  }
};

// 사용자 로그아웃
export const logout = (): void => {
  setAuthToken(null); // JWT 토큰 제거
  localStorage.removeItem(AUTH_USERNAME_KEY); // 사용자 이름 제거
};

// 로그인 상태 확인
export const isAuthenticated = (): boolean => { // 로컬 스토리지에 토큰이 있는지 확인
  return getAuthToken() !== null; // 토큰이 없으면 false 반환
};

// 현재 사용자 정보 가져오기
export const getCurrentUser = (): string | null => {
  return getUsername();
};
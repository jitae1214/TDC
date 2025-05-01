import apiClient, { setAuthToken, getAuthToken } from './apiClient';

// 상수 정의
const AUTH_URL = '/auth';
const AUTH_USERNAME_KEY = 'username';

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
      setAuthToken(response.data.token);
      setUsername(response.data.username || '');
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
  setAuthToken(null);
  localStorage.removeItem(AUTH_USERNAME_KEY);
};

// 로그인 상태 확인
export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};

// 현재 사용자 정보 가져오기
export const getCurrentUser = (): string | null => {
  return getUsername();
};
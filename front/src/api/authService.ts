import apiClient, { setAuthToken, getAuthToken } from './apiClient';

// 상수 정의
// 엔드포인트 경로나 키 이름 변경 되어야 할 때 상수 정의 부분만 고치면 됨
const AUTH_URL = '/api/auth';
const REGISTER_URL = '/api/register'; // 회원가입 관련 새로운 URL 추가
const AUTH_USERNAME_KEY = 'username';
const USER_ID_KEY = 'userId'; // 사용자 ID 저장용 키 추가

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
  userId?: number; // 사용자 ID 추가
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
  userId?: number; // 사용자 ID 추가
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

// 사용자 ID 관리 함수 추가
export const setUserId = (userId: number | string): void => {
  if (userId) {
    localStorage.setItem(USER_ID_KEY, String(userId));
  }
};

export const getUserId = (): number | null => {
  const userId = localStorage.getItem(USER_ID_KEY);
  return userId ? Number(userId) : null;
};

// 로그인 API 호출
export const login = async (loginData: LoginRequest): Promise<LoginResponse> => {
  try {
    console.log("로그인 API 호출:", `${AUTH_URL}/login`, loginData);
    const response = await apiClient.post<LoginResponse>(`${AUTH_URL}/login`, loginData);
    console.log("로그인 API 응답:", response.data);
    
    // 로그인 성공 시 토큰과 사용자 이름 저장
    if (response.data.success && response.data.token) {
      setAuthToken(response.data.token); // JWT 토큰 저장
      setUsername(response.data.username || ''); // 사용자 이름 저장
      
      // 사용자 ID가 있으면 저장
      if (response.data.userId) {
        setUserId(response.data.userId);
        console.log('사용자 ID 저장됨:', response.data.userId);
      } else {
        // 사용자 ID가 없는 경우 API로 사용자 정보 가져오기 시도
        try {
          const userResponse = await apiClient.get(`${AUTH_URL}/me`);
          if (userResponse.data && userResponse.data.id) {
            setUserId(userResponse.data.id);
            console.log('사용자 ID 조회 및 저장됨:', userResponse.data.id);
          }
        } catch (userError) {
          console.error('사용자 ID 조회 실패:', userError);
        }
      }
      
      // 로그인 성공 시 사용자 상태를 ONLINE으로 설정
      try {
        await apiClient.post('/api/users/status', { 
          username: response.data.username, 
          status: 'ONLINE' 
        });
        console.log(`사용자 ${response.data.username} 상태를 ONLINE으로 변경했습니다.`);
      } catch (statusError) {
        console.error('로그인 중 사용자 상태 업데이트 오류:', statusError);
      }
    }
    
    return response.data;
  } catch (error: any) {
    console.error('로그인 오류:', error);
    
    // 상세 오류 정보 로깅
    if (error.response) {
      console.error("오류 응답 데이터:", error.response.data);
      console.error("오류 상태 코드:", error.response.status);
      console.error("오류 헤더:", error.response.headers);
      
      // 서버에서 오류 메시지를 보내는 경우
      if (error.response.data && error.response.data.message) {
        return {
          success: false,
          message: `서버 오류: ${error.response.data.message}`
        };
      }
    }
    
    return {
      success: false,
      message: '서버 연결 중 오류가 발생했습니다.'
    };
  }
};

// 회원가입 API 호출
export const register = async (registerData: RegisterRequest): Promise<RegisterResponse> => {
  try {
    const response = await apiClient.post<RegisterResponse>(`${REGISTER_URL}/signup`, registerData);
    
    // 회원가입 성공 시 사용자 이름을 로컬 스토리지에 저장
    if (response.data.success && response.data.username) {
      // 회원가입 시 바로 로컬 스토리지에 사용자 이름 저장
      localStorage.setItem(AUTH_USERNAME_KEY, response.data.username);
      console.log('회원가입 성공: 사용자 이름 저장됨', response.data.username);
      
      // 사용자 ID가 있으면 저장
      if (response.data.userId) {
        setUserId(response.data.userId);
        console.log('회원가입 성공: 사용자 ID 저장됨', response.data.userId);
      }
    }
    
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
      `${REGISTER_URL}/check-username`, 
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
      `${REGISTER_URL}/check-email`, 
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
export const logout = async (): Promise<void> => {
  // 현재 사용자 ID 가져오기
  const currentUser = getUsername();
  
  // 로그아웃 전에 사용자 상태를 OFFLINE으로 변경
  try {
    if (currentUser) {
      // 사용자 상태를 OFFLINE으로 업데이트하는 API 호출
      await apiClient.post('/api/users/status', { 
        username: currentUser, 
        status: 'OFFLINE' 
      });
      console.log(`사용자 ${currentUser} 상태를 OFFLINE으로 변경했습니다.`);
    }
  } catch (error) {
    console.error('로그아웃 중 사용자 상태 업데이트 오류:', error);
  }
  
  // JWT 토큰 제거
  setAuthToken(null);
  
  // 사용자 이름 관련 데이터 제거
  localStorage.removeItem(AUTH_USERNAME_KEY);
  localStorage.removeItem('username');
  localStorage.removeItem(USER_ID_KEY);
  
  // 워크스페이스 관련 데이터 제거
  localStorage.removeItem('currentWorkspaceId');
  
  // 프로필 관련 데이터 제거
  localStorage.removeItem('profileImage');
  localStorage.removeItem('userProfileImage');
  localStorage.removeItem('userNickname');
  localStorage.removeItem('signupProfileImage');
  
  // 현재 사용자별 저장된 데이터 제거
  if (currentUser) {
    localStorage.removeItem(`profileImage_${currentUser}`);
    localStorage.removeItem(`nickname_${currentUser}`);
    
    // 현재 사용자와 관련된 모든 데이터 제거
    Object.keys(localStorage).forEach(key => {
      if (key.includes(currentUser)) {
        localStorage.removeItem(key);
        console.log(`사용자 관련 데이터 삭제: ${key}`);
      }
    });
  }
  
  // 세션 스토리지에서도 관련 데이터 제거
  sessionStorage.removeItem('token');
  sessionStorage.removeItem(AUTH_USERNAME_KEY);
  sessionStorage.removeItem('username');
  
  console.log('로그아웃: 사용자 관련 데이터가 모두 삭제되었습니다.');
}

// 로그인 상태 확인
export const isAuthenticated = (): boolean => { // 로컬 스토리지에 토큰이 있는지 확인
  return getAuthToken() !== null; // 토큰이 없으면 false 반환
};

// 현재 사용자 정보 가져오기 (문자열 반환)
export const getUsernameFromStorage = (): string | null => {
  return getUsername();
};

// 현재 사용자 상세 정보 가져오기 (API 호출)
export const getCurrentUser = async (): Promise<any> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, message: '인증 토큰이 없습니다.' };
    }
    
    const response = await apiClient.get(`${AUTH_URL}/me`);
    
    // 응답에서 사용자 ID를 추출하여 저장
    if (response.data && response.data.id) {
      setUserId(response.data.id);
      console.log('사용자 정보에서 ID 저장됨:', response.data.id);
    }
    
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('사용자 정보 조회 오류:', error);
    
    if (error.response && error.response.status === 401) {
      // 인증 오류 - 로그인 필요
      return { success: false, message: '로그인이 필요합니다.' };
    }
    
    return { 
      success: false, 
      message: '사용자 정보를 가져오는 중 오류가 발생했습니다.' 
    };
  }
};
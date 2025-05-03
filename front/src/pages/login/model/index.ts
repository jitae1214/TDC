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

const AUTH_USERNAME_KEY = 'username';

// 사용자 이름 관리 함수
// seUsername , getUsername는 백엔드에서 받은 사용자 이름을
// 로컬스토리지에 저장하고 관리하는 헬퍼 함수
export const setUsername = (username: string): void => {
    localStorage.setItem(AUTH_USERNAME_KEY, username);
};

// 토큰 저장 관련 상수
const AUTH_TOKEN_KEY = 'token';
// API 클라이언트 확장 기능들
//토큰 저장 함수
export const setAuthToken = (token: string | null): void => {
    if (token) { // 토큰이 있으면 로컬스토리지에 저장
        localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
    }
};


// // 이거는 어디에 옮기지...
// import axios from 'axios';
// import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
// // API 기본 URL 설정
// const BASE_URL = 'http://localhost:8080/api';
// // axios 인스턴스 생성
// const apiClient: AxiosInstance = axios.create({
//     baseURL: BASE_URL,
//     headers: {
//         'Content-Type': 'application/json',
//     },
//     timeout: 10000, // 요청 타임아웃: 10초
// });
import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import {AvailabilityResponse, RegisterRequest, RegisterResponse} from "../model";

// API 기본 URL 설정
const BASE_URL = 'http://localhost:8080/api';
const AUTH_URL = '/auth';

// axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 요청 타임아웃: 10초
});

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
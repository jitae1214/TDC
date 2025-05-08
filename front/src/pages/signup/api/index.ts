import apiClient from "../../../api/apiClient";
import { RegisterRequest } from "../model";

// API 경로 변경 (프로젝트의 컨트롤러 매핑에 맞게)
const AUTH_BASE_URL = "/api/auth";
const REGISTER_BASE_URL = "/api/register";

/**
 * 회원가입 API 요청
 * @param data 회원가입 정보
 * @returns 회원가입 결과
 */
export const register = async (data: RegisterRequest) => {
    try {
        console.log("회원가입 API 호출:", `${REGISTER_BASE_URL}/signup`, data);
        
        // 프로필 이미지 데이터 크기 확인
        if (data.profileImage) {
            const sizeInBytes = new Blob([data.profileImage]).size;
            const sizeInMB = sizeInBytes / (1024 * 1024);
            console.log(`프로필 이미지 크기: ${sizeInMB.toFixed(2)}MB`);
            
            // 이미지가 5MB를 초과하는 경우
            if (sizeInMB > 5) {
                return {
                    success: false,
                    message: "프로필 이미지 크기가 5MB를 초과합니다."
                };
            }
        }
        
        const response = await apiClient.post(`${REGISTER_BASE_URL}/signup`, data);
        console.log("회원가입 API 응답:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("회원가입 오류:", error);
        
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
            message: "서버 연결 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        };
    }
};

/**
 * 아이디 중복 확인
 * @param username 확인할 아이디
 * @returns 사용 가능 여부
 */
export const checkUsernameAvailability = async (username: string) => {
    try {
        // UsernameAvailabilityRequest 형식에 맞게 요청 객체 생성
        const requestData = { username };
        console.log("아이디 중복 확인 요청:", requestData, `${REGISTER_BASE_URL}/check-username`);
        
        const response = await apiClient.post(`${REGISTER_BASE_URL}/check-username`, requestData);
        console.log("아이디 중복 확인 응답:", response.data);
        return response.data;
    } catch (error) {
        console.error("아이디 중복 확인 오류:", error);
        return {
            available: false,
            message: "서버 연결 중 오류가 발생했습니다."
        };
    }
};

/**
 * 이메일 중복 확인
 * @param email 확인할 이메일
 * @returns 사용 가능 여부
 */
export const checkEmailAvailability = async (email: string) => {
    try {
        // EmailAvailabilityRequest 형식에 맞게 요청 객체 생성
        const requestData = { email };
        console.log("이메일 중복 확인 요청:", requestData, `${REGISTER_BASE_URL}/check-email`);
        
        const response = await apiClient.post(`${REGISTER_BASE_URL}/check-email`, requestData);
        console.log("이메일 중복 확인 응답:", response.data);
        return response.data;
    } catch (error) {
        console.error("이메일 중복 확인 오류:", error);
        return {
            available: false,
            message: "서버 연결 중 오류가 발생했습니다."
        };
    }
};
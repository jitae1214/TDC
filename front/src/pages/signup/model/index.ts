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

// 중복 확인 응답 인터페이스
export interface AvailabilityResponse {
    available: boolean;
    message: string;
}

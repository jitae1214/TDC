// 이거 FSD 아키텍쳐 분리 해야 하는데 일단은 로그인만 먼저 분리
import apiClient, {setAuthToken} from "../../../api/apiClient";
import {LoginRequest, LoginResponse, setUsername} from "../model";

const loginApi = async (loginData: LoginRequest): Promise<LoginResponse> => {
    try {
        console.log("로그인 API 호출:", "/api/auth/login", loginData);
        const response = await apiClient.post<LoginResponse>("/api/auth/login", loginData);
        console.log("로그인 API 응답:", response.data);
        
        if (response.data.success && response.data.token) {
            setAuthToken(response.data.token); // JWT 토큰 저장
            setUsername(response.data.username || ''); // 사용자 이름 저장
            console.log("로그인 성공");
            console.log(response.data);
        }
        return response.data;
    } catch (error: any) {
        console.error("로그인 API 오류:", error);
        
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
            message: "서버 연결 중 오류가 발생했습니다.",
        };
    }
};

export default loginApi;
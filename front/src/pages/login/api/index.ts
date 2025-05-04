// 이거 FSD 아키텍쳐 분리 해야 하는데 일단은 로그인만 먼저 분리
import apiClient, {setAuthToken} from "../../../api/apiClient";
import {LoginRequest, LoginResponse, setUsername} from "../model";

const loginApi = async (loginData: LoginRequest): Promise<LoginResponse> => {
    try {
        const response = await apiClient.post<LoginResponse>("/auth/login", loginData);
        if (response.data.success && response.data.token) {
            setAuthToken(response.data.token); // JWT 토큰 저장
            setUsername(response.data.username || ''); // 사용자 이름 저장
            console.log("로그인 성공");
            console.log(response.data);
        }
        return response.data;
    } catch (error) {
        console.error("로그인 API 오류:", error);
        return {
            success: false,
            message: "서버 연결 중 오류가 발생했습니다.",
        };
    }
};

export default loginApi;
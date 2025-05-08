package com.yhk.webchat.chat_backend.dto.response.auth;

import java.util.Map;

/**
 * 로그인 응답 DTO
 * 로그인 결과 정보를 담는 클래스
 */
public class LoginResponse {
    
    // 성공 여부
    private boolean success;
    
    // 인증 토큰 (JWT 등)
    private String token;
    
    // 사용자 정보 맵 (id, username, email 등)
    private Map<String, Object> userInfo;
    
    // 응답 메시지
    private String message;
    
    // 오류 세부 정보
    private String error;
    
    // 기본 생성자
    public LoginResponse() {
    }
    
    // 실패 응답용 생성자
    public LoginResponse(boolean success, String message, String error) {
        this.success = success;
        this.message = message;
        this.error = error;
    }
    
    // 모든 필드 생성자
    public LoginResponse(boolean success, String token, Map<String, Object> userInfo, String message, String error) {
        this.success = success;
        this.token = token;
        this.userInfo = userInfo;
        this.message = message;
        this.error = error;
    }
    
    // 간편 성공 응답 생성 메서드
    public static LoginResponse success(String token, Map<String, Object> userInfo) {
        return new LoginResponse(true, token, userInfo, "로그인이 성공했습니다.", null);
    }
    
    // 간편 실패 응답 생성 메서드
    public static LoginResponse fail(String message) {
        return new LoginResponse(false, null, null, message, null);
    }
    
    // 상세 오류가 포함된 실패 응답 생성 메서드
    public static LoginResponse fail(String message, String error) {
        return new LoginResponse(false, null, null, message, error);
    }
    
    // Getter와 Setter
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public Map<String, Object> getUserInfo() {
        return userInfo;
    }
    
    public void setUserInfo(Map<String, Object> userInfo) {
        this.userInfo = userInfo;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getError() {
        return error;
    }
    
    public void setError(String error) {
        this.error = error;
    }
} 
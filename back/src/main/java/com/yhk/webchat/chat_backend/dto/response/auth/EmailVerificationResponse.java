package com.yhk.webchat.chat_backend.dto.response.auth;

/**
 * 이메일 인증 응답 DTO
 * 이메일 인증 처리 결과 정보를 담고 있음
 */
public class EmailVerificationResponse {
    private boolean success;   // 인증 성공 여부
    private String message;    // 결과 메시지
    private String email;      // 인증된 이메일 (성공 시)
    
    // 기본 생성자
    public EmailVerificationResponse() {
    }
    
    // 모든 필드 생성자
    public EmailVerificationResponse(boolean success, String message, String email) {
        this.success = success;
        this.message = message;
        this.email = email;
    }
    
    // 성공 응답 생성자
    public EmailVerificationResponse(String email) {
        this.success = true;
        this.message = "이메일 인증이 완료되었습니다.";
        this.email = email;
    }
    
    // Getter 및 Setter 메서드
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
} 
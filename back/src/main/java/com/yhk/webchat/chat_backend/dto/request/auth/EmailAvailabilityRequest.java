package com.yhk.webchat.chat_backend.dto.request.auth;

/**
 * 이메일 중복 확인 요청 DTO
 * 이메일 중복 확인 시 필요한 정보를 담고 있음
 */
public class EmailAvailabilityRequest {
    private String email; // 확인할 이메일 주소
    
    // 기본 생성자
    public EmailAvailabilityRequest() {
    }
    
    // 모든 필드를 포함한 생성자
    public EmailAvailabilityRequest(String email) {
        this.email = email;
    }
    
    // Getter 및 Setter 메서드
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
} 
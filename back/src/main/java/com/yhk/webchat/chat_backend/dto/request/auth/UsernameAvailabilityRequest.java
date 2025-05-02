package com.yhk.webchat.chat_backend.dto.request.auth;

/**
 * 아이디 중복 확인 요청 DTO
 * 사용자 아이디 중복 확인 시 필요한 정보를 담고 있음
 */
public class UsernameAvailabilityRequest {
    private String username; // 확인할 사용자 아이디
    
    // 기본 생성자
    public UsernameAvailabilityRequest() {
    }
    
    // 모든 필드를 포함한 생성자
    public UsernameAvailabilityRequest(String username) {
        this.username = username;
    }
    
    // Getter 및 Setter 메서드
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
} 
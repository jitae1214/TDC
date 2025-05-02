package com.yhk.webchat.chat_backend.dto.request.auth;

/**
 * 로그인 요청 DTO
 * 사용자 인증에 필요한 정보를 담는 클래스
 */
public class LoginRequest {
    
    // 사용자 아이디
    private String username;
    
    // 비밀번호
    private String password;
    
    // 기본 생성자
    public LoginRequest() {
    }
    
    // 모든 필드 초기화 생성자
    public LoginRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }
    
    // Getter와 Setter
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
} 
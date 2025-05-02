package com.yhk.webchat.chat_backend.dto.response.auth;

/**
 * 로그인 응답 DTO
 * 로그인 결과 정보를 담는 클래스
 */
public class LoginResponse {
    
    // 성공 여부
    private boolean success;
    
    // 응답 메시지
    private String message;
    
    // 사용자 ID
    private Long userId;
    
    // 사용자 정보 (이름, 닉네임 등)
    private String username;
    private String nickname;
    
    // 이메일 인증 여부
    private boolean emailVerified;
    
    // 인증 토큰 (JWT 등)
    private String token;
    
    // 기본 생성자
    public LoginResponse() {
    }
    
    // 실패 응답용 생성자
    public LoginResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
    
    // 성공 응답용 생성자
    public LoginResponse(boolean success, String message, Long userId, String username, 
                        String nickname, boolean emailVerified, String token) {
        this.success = success;
        this.message = message;
        this.userId = userId;
        this.username = username;
        this.nickname = nickname;
        this.emailVerified = emailVerified;
        this.token = token;
    }
    
    // 간편 성공 응답 생성 메서드
    public static LoginResponse success(Long userId, String username, String nickname, 
                                      boolean emailVerified, String token) {
        return new LoginResponse(true, "로그인이 성공했습니다.", userId, username, 
                                nickname, emailVerified, token);
    }
    
    // 간편 실패 응답 생성 메서드
    public static LoginResponse fail(String message) {
        return new LoginResponse(false, message);
    }
    
    // Getter와 Setter
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
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getNickname() {
        return nickname;
    }
    
    public void setNickname(String nickname) {
        this.nickname = nickname;
    }
    
    public boolean isEmailVerified() {
        return emailVerified;
    }
    
    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
} 
package com.yhk.webchat.chat_backend.dto;

/**
 * 로그인 응답 DTO
 */
public class LoginResponse {

    private boolean success;
    private String message;
    private String token;
    private String username;
    private String socialId;
    private String provider;

    // 기본 생성자
    public LoginResponse() {
    }

    // 일반 로그인용 생성자
    public LoginResponse(boolean success, String message, String token, String username) {
        this.success = success;
        this.message = message;
        this.token = token;
        this.username = username;
    }

    // 소셜 로그인용 생성자
    public LoginResponse(boolean success, String message, String token, String username, String socialId, String provider) {
        this.success = success;
        this.message = message;
        this.token = token;
        this.username = username;
        this.socialId = socialId;
        this.provider = provider;
    }

    // Getter 및 Setter
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

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getSocialId() {
        return socialId;
    }

    public void setSocialId(String socialId) {
        this.socialId = socialId;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }
} 
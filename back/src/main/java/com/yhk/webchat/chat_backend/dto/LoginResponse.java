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
    private String redirectUrl;

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

    // 리다이렉트 URL이 포함된 로그인 생성자
    public LoginResponse(boolean success, String message, String token, String username, String redirectUrl) {
        this.success = success;
        this.message = message;
        this.token = token;
        this.username = username;
        this.redirectUrl = redirectUrl;
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

    // 소셜 로그인 + 리다이렉트 URL 생성자
    public LoginResponse(boolean success, String message, String token, String username, String socialId, String provider, String redirectUrl) {
        this.success = success;
        this.message = message;
        this.token = token;
        this.username = username;
        this.socialId = socialId;
        this.provider = provider;
        this.redirectUrl = redirectUrl;
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
    
    public String getRedirectUrl() {
        return redirectUrl;
    }
    
    public void setRedirectUrl(String redirectUrl) {
        this.redirectUrl = redirectUrl;
    }
} 
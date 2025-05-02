package com.yhk.webchat.chat_backend.dto;

/**
 * 소셜 로그인 요청 DTO
 */
public class SocialLoginRequest {

    private String code;
    private String provider;

    // 기본 생성자
    public SocialLoginRequest() {
    }

    // 모든 필드를 포함한 생성자
    public SocialLoginRequest(String code, String provider) {
        this.code = code;
        this.provider = provider;
    }

    // Getter 및 Setter
    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    @Override
    public String toString() {
        return "SocialLoginRequest{" +
                "code='" + code + '\'' +
                ", provider='" + provider + '\'' +
                '}';
    }
} 
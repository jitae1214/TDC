package com.yhk.webchat.chat_backend.dto.request.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * 이메일 인증 코드 확인 요청 DTO
 */
public class VerifyCodeRequest {

    @NotBlank(message = "이메일은 필수 입력 항목입니다")
    @Email(message = "유효한 이메일 형식이 아닙니다")
    private String email;

    @NotBlank(message = "인증 코드는 필수 입력 항목입니다")
    private String code;

    // 기본 생성자
    public VerifyCodeRequest() {
    }

    // 모든 필드 생성자
    public VerifyCodeRequest(String email, String code) {
        this.email = email;
        this.code = code;
    }

    // Getter 및 Setter
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    @Override
    public String toString() {
        return "VerifyCodeRequest{" +
                "email='" + email + '\'' +
                ", code='" + code + '\'' +
                '}';
    }
} 
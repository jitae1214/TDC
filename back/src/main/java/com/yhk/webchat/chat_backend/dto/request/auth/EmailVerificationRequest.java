package com.yhk.webchat.chat_backend.dto.request.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * 이메일 인증 요청 DTO
 * 이메일 인증 요청 시 필요한 정보를 담고 있음 
 * (인증 메일 재전송 등에 사용)
 */
public class EmailVerificationRequest {
    @NotBlank(message = "이메일은 필수 입력 항목입니다")
    @Email(message = "유효한 이메일 형식이 아닙니다")
    private String email; // 인증할 이메일 주소
    private String verificationCode; // 인증 코드
    
    // 기본 생성자
    public EmailVerificationRequest() {
    }
    
    // 모든 필드를 포함한 생성자
    public EmailVerificationRequest(String email, String verificationCode) {
        this.email = email;
        this.verificationCode = verificationCode;
    }
    
    // 이메일만 포함한 생성자
    public EmailVerificationRequest(String email) {
        this.email = email;
    }
    
    // Getter 및 Setter 메서드
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getVerificationCode() {
        return verificationCode;
    }
    
    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }
} 
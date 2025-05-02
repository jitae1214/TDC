package com.yhk.webchat.chat_backend.dto.response.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 회원가입 응답 DTO
 * 회원가입 처리 결과 정보를 담고 있음
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterResponse {
    private boolean success;       // 회원가입 성공 여부
    private String message;        // 결과 메시지
    private Long userId;           // 생성된 사용자 ID (성공시)
    private boolean emailVerified; // 이메일 인증 상태
    
    /**
     * 성공 응답 생성자
     * @param userId 사용자 ID
     * @param emailVerified 이메일 인증 여부
     */
    public RegisterResponse(Long userId, boolean emailVerified) {
        this.success = true;
        this.message = "회원가입이 완료되었습니다.";
        this.userId = userId;
        this.emailVerified = emailVerified;
    }
    
    /**
     * 실패 응답 생성자
     * @param message 실패 메시지
     */
    public RegisterResponse(String message) {
        this.success = false;
        this.message = message;
        this.userId = null;
        this.emailVerified = false;
    }
    
    /**
     * 성공/실패 응답 생성자
     * @param success 성공 여부
     * @param message 메시지
     */
    public RegisterResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
        this.userId = null;
        this.emailVerified = false;
    }
} 
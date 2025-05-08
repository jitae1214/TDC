package com.yhk.webchat.chat_backend.dto.request.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 비밀번호 재설정 요청 DTO
 */
public class PasswordResetRequest {

    @NotBlank(message = "이메일은 필수 입력 항목입니다")
    @Email(message = "유효한 이메일 형식이 아닙니다")
    private String email;

    @NotBlank(message = "인증 코드는 필수 입력 항목입니다")
    private String code;

    @NotBlank(message = "새 비밀번호는 필수 입력 항목입니다")
    @Size(min = 8, max = 20, message = "비밀번호는 8자 이상 20자 이하여야 합니다")
    private String newPassword;

    @NotBlank(message = "비밀번호 확인은 필수 입력 항목입니다")
    private String confirmPassword;

    // 기본 생성자
    public PasswordResetRequest() {
    }

    // 모든 필드 생성자
    public PasswordResetRequest(String email, String code, String newPassword, String confirmPassword) {
        this.email = email;
        this.code = code;
        this.newPassword = newPassword;
        this.confirmPassword = confirmPassword;
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

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }
    
    /**
     * 새 비밀번호와 확인 비밀번호가 일치하는지 확인
     * @return 일치 여부
     */
    public boolean isPasswordMatch() {
        return newPassword != null && newPassword.equals(confirmPassword);
    }

    @Override
    public String toString() {
        return "PasswordResetRequest{" +
                "email='" + email + '\'' +
                ", code='********'" +
                ", newPassword='********'" +
                ", confirmPassword='********'" +
                '}';
    }
} 
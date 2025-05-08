package com.yhk.webchat.chat_backend.dto.request.workspace;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * 워크스페이스 멤버 추가 요청 DTO
 */
public class AddMemberRequest {
    
    @NotBlank(message = "사용자 식별자는 필수입니다")
    private String userIdentifier; // 사용자 ID나 이메일 또는 사용자명
    
    @NotBlank(message = "역할은 필수입니다")
    @Pattern(regexp = "ADMIN|MEMBER", message = "역할은 ADMIN 또는 MEMBER만 가능합니다")
    private String role;
    
    // 기본 생성자
    public AddMemberRequest() {}
    
    // 모든 필드 생성자
    public AddMemberRequest(String userIdentifier, String role) {
        this.userIdentifier = userIdentifier;
        this.role = role;
    }
    
    // Getter 및 Setter
    public String getUserIdentifier() {
        return userIdentifier;
    }
    
    public void setUserIdentifier(String userIdentifier) {
        this.userIdentifier = userIdentifier;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    @Override
    public String toString() {
        return "AddMemberRequest{" +
                "userIdentifier='" + userIdentifier + '\'' +
                ", role='" + role + '\'' +
                '}';
    }
} 
package com.yhk.webchat.chat_backend.dto.request.workspace;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * 워크스페이스 멤버 역할 변경 요청 DTO
 */
public class UpdateMemberRoleRequest {
    
    @NotBlank(message = "역할은 필수입니다")
    @Pattern(regexp = "OWNER|ADMIN|MEMBER", message = "역할은 OWNER, ADMIN 또는 MEMBER만 가능합니다")
    private String role;
    
    // 기본 생성자
    public UpdateMemberRoleRequest() {}
    
    // 생성자
    public UpdateMemberRoleRequest(String role) {
        this.role = role;
    }
    
    // Getter 및 Setter
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    @Override
    public String toString() {
        return "UpdateMemberRoleRequest{" +
                "role='" + role + '\'' +
                '}';
    }
} 
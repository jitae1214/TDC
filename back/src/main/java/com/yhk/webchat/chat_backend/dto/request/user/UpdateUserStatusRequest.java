package com.yhk.webchat.chat_backend.dto.request.user;

/**
 * 사용자 상태 업데이트 요청 DTO
 */
public class UpdateUserStatusRequest {
    
    private String status;
    private Long userId;
    private String username;
    
    // 기본 생성자
    public UpdateUserStatusRequest() {
    }
    
    // 모든 필드 생성자
    public UpdateUserStatusRequest(String status, Long userId, String username) {
        this.status = status;
        this.userId = userId;
        this.username = username;
    }
    
    // Getter/Setter
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
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
} 
package com.yhk.webchat.chat_backend.dto.response.workspace;

import java.time.LocalDateTime;

import com.yhk.webchat.chat_backend.model.User;
import com.yhk.webchat.chat_backend.model.WorkspaceMembership;

/**
 * 워크스페이스 멤버 응답 DTO
 */
public class WorkspaceMemberResponse {
    
    private Long userId;
    private String username;
    private String nickname;
    private String email;
    private String profileImageUrl;
    private String role;
    private LocalDateTime joinedAt;
    private String status; // 사용자 상태 (ONLINE, OFFLINE, AWAY)
    
    // 기본 생성자
    public WorkspaceMemberResponse() {}
    
    // 엔티티를 DTO로 변환하는 생성자
    public WorkspaceMemberResponse(WorkspaceMembership membership) {
        User user = membership.getUser();
        this.userId = user.getId();
        this.username = user.getUsername();
        this.nickname = user.getNickname();
        this.email = user.getEmail();
        this.profileImageUrl = user.getProfileImageUrl();
        this.role = membership.getRole();
        this.joinedAt = membership.getJoinedAt();
        this.status = user.getStatus();
    }
    
    // Getter 및 Setter
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
    
    public String getNickname() {
        return nickname;
    }
    
    public void setNickname(String nickname) {
        this.nickname = nickname;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getProfileImageUrl() {
        return profileImageUrl;
    }
    
    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }
    
    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
} 
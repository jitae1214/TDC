package com.yhk.webchat.chat_backend.dto.response.workspace;

import java.time.LocalDateTime;

import com.yhk.webchat.chat_backend.model.Workspace;

/**
 * 워크스페이스 응답 DTO
 */
public class WorkspaceResponse {
    
    private Long id;
    private String name;
    private String description;
    private Long ownerId;
    private String ownerUsername;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String iconColor;
    private int memberCount;
    private String memberRole; // 현재 요청한 사용자의 역할
    
    // 기본 생성자
    public WorkspaceResponse() {}
    
    // 엔티티를 DTO로 변환하는 생성자
    public WorkspaceResponse(Workspace workspace, int memberCount, String memberRole) {
        this.id = workspace.getId();
        this.name = workspace.getName();
        this.description = workspace.getDescription();
        this.ownerId = workspace.getOwner().getId();
        this.ownerUsername = workspace.getOwner().getUsername();
        this.createdAt = workspace.getCreatedAt();
        this.updatedAt = workspace.getUpdatedAt();
        this.iconColor = workspace.getIconColor();
        this.memberCount = memberCount;
        this.memberRole = memberRole;
    }
    
    // Getter 및 Setter
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Long getOwnerId() {
        return ownerId;
    }
    
    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }
    
    public String getOwnerUsername() {
        return ownerUsername;
    }
    
    public void setOwnerUsername(String ownerUsername) {
        this.ownerUsername = ownerUsername;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public String getIconColor() {
        return iconColor;
    }
    
    public void setIconColor(String iconColor) {
        this.iconColor = iconColor;
    }
    
    public int getMemberCount() {
        return memberCount;
    }
    
    public void setMemberCount(int memberCount) {
        this.memberCount = memberCount;
    }
    
    public String getMemberRole() {
        return memberRole;
    }
    
    public void setMemberRole(String memberRole) {
        this.memberRole = memberRole;
    }
} 
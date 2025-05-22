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
    private String ownerName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String iconColor;
    private String imageUrl;
    private int memberCount;
    private String userRole;
    private Long defaultChatRoomId;
    
    // 기본 생성자
    public WorkspaceResponse() {}
    
    // 엔티티를 DTO로 변환하는 생성자
    public WorkspaceResponse(Workspace workspace, int memberCount, String userRole) {
        this.id = workspace.getId();
        this.name = workspace.getName();
        this.description = workspace.getDescription();
        
        // 소유자 정보
        if (workspace.getOwner() != null) {
            this.ownerId = workspace.getOwner().getId();
            this.ownerName = workspace.getOwner().getUsername();
        }
        
        this.createdAt = workspace.getCreatedAt();
        this.updatedAt = workspace.getUpdatedAt();
        this.iconColor = workspace.getIconColor();
        this.imageUrl = workspace.getImageUrl();
        this.memberCount = memberCount;
        this.userRole = userRole;
        
        // 기본 채팅방 ID 설정
        if (workspace.getDefaultChatRoom() != null) {
            this.defaultChatRoomId = workspace.getDefaultChatRoom().getId();
        }
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
    
    public String getOwnerName() {
        return ownerName;
    }
    
    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
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
    
    public String getImageUrl() {
        return imageUrl;
    }
    
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    
    public int getMemberCount() {
        return memberCount;
    }
    
    public void setMemberCount(int memberCount) {
        this.memberCount = memberCount;
    }
    
    public String getUserRole() {
        return userRole;
    }
    
    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }
    
    public Long getDefaultChatRoomId() {
        return defaultChatRoomId;
    }
    
    public void setDefaultChatRoomId(Long defaultChatRoomId) {
        this.defaultChatRoomId = defaultChatRoomId;
    }
} 
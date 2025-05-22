package com.yhk.webchat.chat_backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Builder;

/**
 * 워크스페이스 정보 엔티티
 */
@Entity
@Table(name = "workspaces")
public class Workspace {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(length = 500)
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "icon_color", length = 20)
    private String iconColor;
    
    @Column(name = "image_url", length = 255)
    private String imageUrl;
    
    @OneToOne
    @JoinColumn(name = "default_chat_room_id")
    private ChatRoom defaultChatRoom;
    
    // 기본 생성자
    public Workspace() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // 필수 필드를 포함한 생성자
    public Workspace(String name, User owner) {
        this.name = name;
        this.owner = owner;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // 모든 필드를 포함한 생성자
    public Workspace(String name, String description, User owner, String iconColor, String imageUrl) {
        this.name = name;
        this.description = description;
        this.owner = owner;
        this.iconColor = iconColor;
        this.imageUrl = imageUrl;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // 빌더 메서드
    @Builder
    public static Workspace createWorkspace(String name, String description, User owner, String iconColor, String imageUrl) {
        Workspace workspace = new Workspace();
        workspace.name = name;
        workspace.description = description;
        workspace.owner = owner;
        workspace.iconColor = iconColor;
        workspace.imageUrl = imageUrl;
        workspace.createdAt = LocalDateTime.now();
        workspace.updatedAt = LocalDateTime.now();
        return workspace;
    }
    
    // Getter 및 Setter 메서드
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
        this.updatedAt = LocalDateTime.now(); // 이름 변경 시 updatedAt 자동 갱신
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
        this.updatedAt = LocalDateTime.now(); // 설명 변경 시 updatedAt 자동 갱신
    }
    
    public User getOwner() {
        return owner;
    }
    
    public void setOwner(User owner) {
        this.owner = owner;
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
        this.updatedAt = LocalDateTime.now(); // 아이콘 색상 변경 시 updatedAt 자동 갱신
    }
    
    public String getImageUrl() {
        return imageUrl;
    }
    
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
        this.updatedAt = LocalDateTime.now(); // 이미지 URL 변경 시 updatedAt 자동 갱신
    }
    
    public ChatRoom getDefaultChatRoom() {
        return defaultChatRoom;
    }
    
    public void setDefaultChatRoom(ChatRoom defaultChatRoom) {
        this.defaultChatRoom = defaultChatRoom;
        this.updatedAt = LocalDateTime.now(); // 기본 채팅방 변경 시 updatedAt 자동 갱신
    }
    
    // 빌더 패턴 구현
    public static WorkspaceBuilder builder() {
        return new WorkspaceBuilder();
    }
    
    // 빌더 클래스
    public static class WorkspaceBuilder {
        private String name;
        private String description;
        private User owner;
        private String iconColor;
        private String imageUrl;
        private ChatRoom defaultChatRoom;
        
        public WorkspaceBuilder name(String name) {
            this.name = name;
            return this;
        }
        
        public WorkspaceBuilder description(String description) {
            this.description = description;
            return this;
        }
        
        public WorkspaceBuilder owner(User owner) {
            this.owner = owner;
            return this;
        }
        
        public WorkspaceBuilder iconColor(String iconColor) {
            this.iconColor = iconColor;
            return this;
        }
        
        public WorkspaceBuilder imageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
            return this;
        }
        
        public WorkspaceBuilder defaultChatRoom(ChatRoom defaultChatRoom) {
            this.defaultChatRoom = defaultChatRoom;
            return this;
        }
        
        public Workspace build() {
            Workspace workspace = new Workspace(name, description, owner, iconColor, imageUrl);
            workspace.setDefaultChatRoom(defaultChatRoom);
            return workspace;
        }
    }
    
    // toString 메서드
    @Override
    public String toString() {
        return "Workspace{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", owner=" + (owner != null ? owner.getUsername() : "null") +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                ", iconColor='" + iconColor + '\'' +
                ", imageUrl='" + imageUrl + '\'' +
                ", defaultChatRoom=" + (defaultChatRoom != null ? defaultChatRoom.getId() : "null") +
                '}';
    }
} 
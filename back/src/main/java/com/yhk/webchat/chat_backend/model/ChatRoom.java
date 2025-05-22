package com.yhk.webchat.chat_backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * 채팅방 엔티티
 */
@Entity
@Table(name = "chat_rooms")
public class ChatRoom {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column
    private String description;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id")
    private User creator;
    
    @Column(name = "is_direct", nullable = false)
    private boolean isDirect = false;
    
    // ManyToMany 관계 제거하고 One-to-Many 관계로 변경
    @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ChatRoomMember> members = new HashSet<>();
    
    // 생성자
    public ChatRoom() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getter & Setter
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
    
    public Workspace getWorkspace() {
        return workspace;
    }
    
    public void setWorkspace(Workspace workspace) {
        this.workspace = workspace;
    }
    
    public User getCreator() {
        return creator;
    }
    
    public void setCreator(User creator) {
        this.creator = creator;
    }
    
    public boolean isDirect() {
        return isDirect;
    }
    
    public void setDirect(boolean direct) {
        isDirect = direct;
    }
    
    public Set<ChatRoomMember> getMembers() {
        return members;
    }
    
    public void setMembers(Set<ChatRoomMember> members) {
        this.members = members;
    }
    
    // 채팅방 멤버 추가
    public void addMember(User user) {
        ChatRoomMember member = new ChatRoomMember(this, user);
        members.add(member);
    }
    
    // 채팅방 멤버 제거
    public void removeMember(User user) {
        members.removeIf(member -> member.getUser().getId().equals(user.getId()));
    }
    
    // 특정 사용자가 채팅방 멤버인지 확인
    public boolean isMember(User user) {
        return members.stream()
                .anyMatch(member -> member.getUser().getId().equals(user.getId()));
    }
    
    // 상태 업데이트
    public void updateLastActivity() {
        this.updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 
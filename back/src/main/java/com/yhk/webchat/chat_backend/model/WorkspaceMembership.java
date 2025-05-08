package com.yhk.webchat.chat_backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;

/**
 * 워크스페이스 멤버십 정보 엔티티
 */
@Entity
@Table(name = "workspace_memberships")
public class WorkspaceMembership {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false, length = 20)
    private String role;  // OWNER, ADMIN, MEMBER
    
    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt;
    
    // 기본 생성자
    public WorkspaceMembership() {
        this.joinedAt = LocalDateTime.now();
    }
    
    // 필수 필드를 포함한 생성자
    public WorkspaceMembership(Workspace workspace, User user, String role) {
        this.workspace = workspace;
        this.user = user;
        this.role = role;
        this.joinedAt = LocalDateTime.now();
    }
    
    // 모든 필드를 포함한 생성자
    public WorkspaceMembership(Workspace workspace, User user, String role, LocalDateTime joinedAt) {
        this.workspace = workspace;
        this.user = user;
        this.role = role;
        this.joinedAt = joinedAt != null ? joinedAt : LocalDateTime.now();
    }
    
    // Getter 및 Setter 메서드
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Workspace getWorkspace() {
        return workspace;
    }
    
    public void setWorkspace(Workspace workspace) {
        this.workspace = workspace;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
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
    
    // 역할 확인 메서드
    public boolean isOwner() {
        return "OWNER".equals(this.role);
    }
    
    public boolean isAdmin() {
        return "ADMIN".equals(this.role) || isOwner();
    }
    
    public boolean isMember() {
        return "MEMBER".equals(this.role) || isAdmin();
    }
    
    // 빌더 패턴 구현
    public static WorkspaceMembershipBuilder builder() {
        return new WorkspaceMembershipBuilder();
    }
    
    // 빌더 클래스
    public static class WorkspaceMembershipBuilder {
        private Workspace workspace;
        private User user;
        private String role;
        private LocalDateTime joinedAt;
        
        public WorkspaceMembershipBuilder workspace(Workspace workspace) {
            this.workspace = workspace;
            return this;
        }
        
        public WorkspaceMembershipBuilder user(User user) {
            this.user = user;
            return this;
        }
        
        public WorkspaceMembershipBuilder role(String role) {
            this.role = role;
            return this;
        }
        
        public WorkspaceMembershipBuilder joinedAt(LocalDateTime joinedAt) {
            this.joinedAt = joinedAt;
            return this;
        }
        
        public WorkspaceMembership build() {
            return new WorkspaceMembership(workspace, user, role, joinedAt);
        }
    }
    
    // toString 메서드
    @Override
    public String toString() {
        return "WorkspaceMembership{" +
                "id=" + id +
                ", workspace=" + (workspace != null ? workspace.getName() : "null") +
                ", user=" + (user != null ? user.getUsername() : "null") +
                ", role='" + role + '\'' +
                ", joinedAt=" + joinedAt +
                '}';
    }
} 
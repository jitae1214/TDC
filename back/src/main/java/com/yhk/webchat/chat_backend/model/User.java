package com.yhk.webchat.chat_backend.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * 사용자 정보 엔티티
 */
@Entity /* Entity : 데이터베이스 테이블로 매핑됨 */
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 50)
    private String username;
    
    @Column(nullable = false)
    @JsonIgnore
    private String password;
    
    @Column(nullable = false, unique = true, length = 100)
    private String email;
    
    @Column(name = "full_name", length = 100)
    private String fullName;
    
    @Column(length = 50)
    private String nickname;
    
    @Column(length = 20)
    private String status; // ONLINE, OFFLINE, AWAY
    
    @Column(name = "email_verified")
    private boolean emailVerified;
    
    @Column(name = "profile_image_url")
    private String profileImageUrl;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;
    
    // 소셜 로그인 필드
    @Column(name = "social_id")
    private String socialId;
    
    @Column(name = "provider", length = 20)
    private String provider;
    
    @ManyToMany
    @JoinTable(
        name = "user_friends",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "friend_id")
    )
    @JsonIgnore
    private List<User> friends = new ArrayList<>();
    
    // 사용자가 속한 채팅방 멤버십 관계 추가
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<ChatRoomMember> chatRoomMemberships = new HashSet<>();
    
    // 기본 생성자
    public User() {
    }
    
    // 빌더 패턴 대신 모든 필드를 받는 생성자
    public User(Long id, String username, String password, String email, String fullName, 
                String nickname, String status, boolean emailVerified, String profileImageUrl, 
                LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime lastLoginAt,
                String socialId, String provider) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.fullName = fullName;
        this.nickname = nickname;
        this.status = status;
        this.emailVerified = emailVerified;
        this.profileImageUrl = profileImageUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.lastLoginAt = lastLoginAt;
        this.socialId = socialId;
        this.provider = provider;
    }
    
    // 필수 필드만 있는 생성자
    public User(String username, String password, String email) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.status = "OFFLINE";
        this.emailVerified = false;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getter 및 Setter 메서드

    // 사용자 아이디 반환
    public Long getId() {
        return id;
    }

    // 사용자 아이디 설정
    public void setId(Long id) {
        this.id = id;
    }

    // 사용자 이름 반환
    public String getUsername() {
        return username;
    }

    // 사용자 이름 설정
    public void setUsername(String username) {
        this.username = username;
    }

    // 사용자 비밀번호 반환
    public String getPassword() {
        return password;
    }

    // 사용자 비밀번호 설정
    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    // 사용자 상태 반환
    public String getStatus() {
        return status;
    }

    // 사용자 상태 설정
    public void setStatus(String status) {
        this.status = status;
    }

    // 이메일 인증 여부 반환
    public boolean isEmailVerified() {
        return emailVerified;
    }

    // 이메일 인증 여부 설정
    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    // 프로필 이미지 URL 반환
    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    // 프로필 이미지 URL 설정
    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    // 생성 시간 반환
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // 생성 시간 설정
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // 업데이트 시간 반환
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    // 업데이트 시간 설정
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // 마지막 로그인 시간 반환
    public LocalDateTime getLastLoginAt() {
        return lastLoginAt;
    }

    // 마지막 로그인 시간 설정
    public void setLastLoginAt(LocalDateTime lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    // 소셜 로그인 관련 Getter/Setter 추가
    public String getSocialId() {
        return socialId;
    }

    // 소셜 로그인 관련 ID 설정
    public void setSocialId(String socialId) {
        this.socialId = socialId;
    }

    // 소셜 로그인 관련 공급자 반환
    public String getProvider() {
        return provider;
    }

    // 소셜 로그인 관련 공급자 설정
    public void setProvider(String provider) {
        this.provider = provider;
    }

    // 친구 목록 반환
    public List<User> getFriends() {
        return friends;
    }

    // 친구 목록 설정
    public void setFriends(List<User> friends) {
        this.friends = friends;
    }
    
    // 친구 추가 메서드
    public void addFriend(User friend) {
        if (!this.friends.contains(friend)) {
            this.friends.add(friend);
        }
    }
    
    // 친구 삭제 메서드
    public void removeFriend(User friend) {
        this.friends.remove(friend);
    }
    
    // 채팅방 멤버십 반환
    public Set<ChatRoomMember> getChatRoomMemberships() {
        return chatRoomMemberships;
    }

    // 채팅방 멤버십 설정
    public void setChatRoomMemberships(Set<ChatRoomMember> chatRoomMemberships) {
        this.chatRoomMemberships = chatRoomMemberships;
    }
    
    // 상태 변경시 모든 채팅방 멤버 상태 동기화
    public void updateStatus(String newStatus) {
        this.status = newStatus;
        this.updatedAt = LocalDateTime.now();
        
        // 사용자가 속한 모든 채팅방 멤버의 상태도 업데이트
        if (chatRoomMemberships != null) {
            for (ChatRoomMember membership : chatRoomMemberships) {
                membership.setUserStatus(newStatus);
            }
        }
    }
    
    // 빌더 패턴 구현을 위한 정적 내부 클래스
    public static UserBuilder builder() {
        return new UserBuilder();
    }
    
    public static class UserBuilder {
        private Long id;
        private String username;
        private String password;
        private String email;
        private String fullName;
        private String nickname;
        private String status;
        private boolean emailVerified;
        private String profileImageUrl;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime lastLoginAt;
        private String socialId;
        private String provider;
        
        public UserBuilder id(Long id) {
            this.id = id;
            return this;
        }
        
        public UserBuilder username(String username) {
            this.username = username;
            return this;
        }
        
        public UserBuilder password(String password) {
            this.password = password;
            return this;
        }
        
        public UserBuilder email(String email) {
            this.email = email;
            return this;
        }
        
        public UserBuilder fullName(String fullName) {
            this.fullName = fullName;
            return this;
        }
        
        public UserBuilder nickname(String nickname) {
            this.nickname = nickname;
            return this;
        }
        
        public UserBuilder status(String status) {
            this.status = status;
            return this;
        }
        
        public UserBuilder emailVerified(boolean emailVerified) {
            this.emailVerified = emailVerified;
            return this;
        }
        
        public UserBuilder profileImageUrl(String profileImageUrl) {
            this.profileImageUrl = profileImageUrl;
            return this;
        }
        
        public UserBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }
        
        public UserBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }
        
        public UserBuilder lastLoginAt(LocalDateTime lastLoginAt) {
            this.lastLoginAt = lastLoginAt;
            return this;
        }
        
        // 소셜 로그인 관련 빌더 메서드 추가
        public UserBuilder socialId(String socialId) {
            this.socialId = socialId;
            return this;
        }
        
        public UserBuilder provider(String provider) {
            this.provider = provider;
            return this;
        }

        // 사용자 객체 생성
        public User build() {
            return new User(id, username, password, email, fullName, nickname, status, emailVerified, 
                    profileImageUrl, createdAt, updatedAt, lastLoginAt, socialId, provider);
        }
    }
} 
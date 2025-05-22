package com.yhk.webchat.chat_backend.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 채팅방 멤버 엔티티
 * 사용자의 상태 정보를 저장하는 연결 테이블
 */
@Entity
@Table(name = "chat_room_members")
public class ChatRoomMember {
    
    @EmbeddedId
    private ChatRoomMemberId id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("chatRoomId")
    @JoinColumn(name = "chat_room_id")
    private ChatRoom chatRoom;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;
    
    @Column(name = "joined_at")
    private LocalDateTime joinedAt;
    
    @Column(name = "last_read_at")
    private LocalDateTime lastReadAt;
    
    @Column(name = "user_status")
    private String userStatus; // ONLINE, OFFLINE, AWAY 상태를 복제
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // 생성자
    public ChatRoomMember() {
        this.joinedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public ChatRoomMember(ChatRoom chatRoom, User user) {
        this.id = new ChatRoomMemberId(chatRoom.getId(), user.getId());
        this.chatRoom = chatRoom;
        this.user = user;
        this.userStatus = user.getStatus();
        this.joinedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getter & Setter
    public ChatRoomMemberId getId() {
        return id;
    }
    
    public void setId(ChatRoomMemberId id) {
        this.id = id;
    }
    
    public ChatRoom getChatRoom() {
        return chatRoom;
    }
    
    public void setChatRoom(ChatRoom chatRoom) {
        this.chatRoom = chatRoom;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }
    
    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }
    
    public LocalDateTime getLastReadAt() {
        return lastReadAt;
    }
    
    public void setLastReadAt(LocalDateTime lastReadAt) {
        this.lastReadAt = lastReadAt;
    }
    
    public String getUserStatus() {
        return userStatus;
    }
    
    public void setUserStatus(String userStatus) {
        this.userStatus = userStatus;
        this.updatedAt = LocalDateTime.now();
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    // 사용자 상태 업데이트
    public void updateUserStatus(String status) {
        this.userStatus = status;
        this.updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * 복합 키 클래스
     */
    @Embeddable
    public static class ChatRoomMemberId implements Serializable {
        
        private static final long serialVersionUID = 1L;
        
        @Column(name = "chat_room_id")
        private Long chatRoomId;
        
        @Column(name = "user_id")
        private Long userId;
        
        public ChatRoomMemberId() {
        }
        
        public ChatRoomMemberId(Long chatRoomId, Long userId) {
            this.chatRoomId = chatRoomId;
            this.userId = userId;
        }
        
        public Long getChatRoomId() {
            return chatRoomId;
        }
        
        public void setChatRoomId(Long chatRoomId) {
            this.chatRoomId = chatRoomId;
        }
        
        public Long getUserId() {
            return userId;
        }
        
        public void setUserId(Long userId) {
            this.userId = userId;
        }
        
        @Override
        public int hashCode() {
            final int prime = 31;
            int result = 1;
            result = prime * result + ((chatRoomId == null) ? 0 : chatRoomId.hashCode());
            result = prime * result + ((userId == null) ? 0 : userId.hashCode());
            return result;
        }
        
        @Override
        public boolean equals(Object obj) {
            if (this == obj) return true;
            if (obj == null || getClass() != obj.getClass()) return false;
            ChatRoomMemberId other = (ChatRoomMemberId) obj;
            if (chatRoomId == null) {
                if (other.chatRoomId != null) return false;
            } else if (!chatRoomId.equals(other.chatRoomId)) return false;
            if (userId == null) {
                if (other.userId != null) return false;
            } else if (!userId.equals(other.userId)) return false;
            return true;
        }
    }
} 
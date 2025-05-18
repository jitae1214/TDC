package com.yhk.webchat.chat_backend.dto.chat;

import java.time.LocalDateTime;

/**
 * 채팅 메시지 DTO
 * 클라이언트와 서버 간 메시지 전송에 사용
 */
public class ChatMessage {
    
    /**
     * 메시지 타입 정의
     */
    public enum MessageType {
        CHAT,       // 일반 채팅 메시지
        JOIN,       // 채팅방 입장
        LEAVE,      // 채팅방 퇴장
        TYPING,     // 타이핑 중
        READ        // 읽음 확인
    }
    
    private String id;              // 메시지 고유 ID
    private Long chatRoomId;        // 채팅방 ID
    private Long senderId;          // 발신자 ID
    private String senderName;      // 발신자 이름
    private String content;         // 메시지 내용
    private MessageType type;       // 메시지 타입
    private LocalDateTime timestamp; // 메시지 전송 시간
    private String senderProfileUrl; // 발신자 프로필 이미지 URL
    
    // 기본 생성자
    public ChatMessage() {
        this.timestamp = LocalDateTime.now();
    }
    
    // 모든 필드를 매개변수로 받는 생성자
    public ChatMessage(String id, Long chatRoomId, Long senderId, String senderName, 
                       String content, MessageType type, LocalDateTime timestamp, 
                       String senderProfileUrl) {
        this.id = id;
        this.chatRoomId = chatRoomId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.content = content;
        this.type = type;
        this.timestamp = timestamp != null ? timestamp : LocalDateTime.now();
        this.senderProfileUrl = senderProfileUrl;
    }
    
    // Getter & Setter
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public Long getChatRoomId() {
        return chatRoomId;
    }
    
    public void setChatRoomId(Long chatRoomId) {
        this.chatRoomId = chatRoomId;
    }
    
    public Long getSenderId() {
        return senderId;
    }
    
    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }
    
    public String getSenderName() {
        return senderName;
    }
    
    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public MessageType getType() {
        return type;
    }
    
    public void setType(MessageType type) {
        this.type = type;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public String getSenderProfileUrl() {
        return senderProfileUrl;
    }
    
    public void setSenderProfileUrl(String senderProfileUrl) {
        this.senderProfileUrl = senderProfileUrl;
    }
    
    @Override
    public String toString() {
        return "ChatMessage{" +
                "id='" + id + '\'' +
                ", chatRoomId=" + chatRoomId +
                ", senderId=" + senderId +
                ", senderName='" + senderName + '\'' +
                ", type=" + type +
                ", timestamp=" + timestamp +
                '}';
    }
} 
package com.yhk.webchat.chat_backend.repository;

import com.yhk.webchat.chat_backend.model.ChatMessage;
import com.yhk.webchat.chat_backend.model.ChatRoom;
import com.yhk.webchat.chat_backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 채팅 메시지 데이터 접근 인터페이스
 */
@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    /**
     * 채팅방의 모든 메시지 조회 (최신순)
     */
    List<ChatMessage> findByChatRoomOrderByCreatedAtDesc(ChatRoom chatRoom);
    
    /**
     * 채팅방의 모든 메시지 페이지네이션 조회
     */
    Page<ChatMessage> findByChatRoomOrderByCreatedAtDesc(ChatRoom chatRoom, Pageable pageable);
    
    /**
     * 특정 시간 이후의 채팅방 메시지 조회
     */
    List<ChatMessage> findByChatRoomAndCreatedAtAfterOrderByCreatedAtAsc(
        ChatRoom chatRoom, 
        LocalDateTime timestamp
    );
    
    /**
     * 사용자가 읽지 않은 메시지 수 조회
     */
    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.chatRoom = :chatRoom AND m NOT IN " +
           "(SELECT m2 FROM ChatMessage m2 JOIN m2.readBy r WHERE r = :user)")
    long countUnreadMessages(@Param("chatRoom") ChatRoom chatRoom, @Param("user") User user);
    
    /**
     * 사용자가 읽지 않은 메시지 목록 조회
     */
    @Query("SELECT m FROM ChatMessage m WHERE m.chatRoom = :chatRoom AND m NOT IN " +
           "(SELECT m2 FROM ChatMessage m2 JOIN m2.readBy r WHERE r = :user) " +
           "ORDER BY m.createdAt ASC")
    List<ChatMessage> findUnreadMessages(@Param("chatRoom") ChatRoom chatRoom, @Param("user") User user);
    
    /**
     * 채팅방의 마지막 메시지 조회
     */
    ChatMessage findTopByChatRoomOrderByCreatedAtDesc(ChatRoom chatRoom);
    
    /**
     * 채팅 내용 검색
     */
    @Query("SELECT m FROM ChatMessage m WHERE m.chatRoom = :chatRoom AND LOWER(m.content) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY m.createdAt DESC")
    List<ChatMessage> searchMessages(@Param("chatRoom") ChatRoom chatRoom, @Param("keyword") String keyword);
} 
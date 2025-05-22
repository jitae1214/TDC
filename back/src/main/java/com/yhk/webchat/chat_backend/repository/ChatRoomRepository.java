package com.yhk.webchat.chat_backend.repository;

import com.yhk.webchat.chat_backend.model.ChatRoom;
import com.yhk.webchat.chat_backend.model.ChatRoomMember;
import com.yhk.webchat.chat_backend.model.User;
import com.yhk.webchat.chat_backend.model.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 채팅방 데이터 접근 인터페이스
 */
@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    
    /**
     * 워크스페이스 내 모든 채팅방 조회
     */
    List<ChatRoom> findByWorkspace(Workspace workspace);
    
    /**
     * 사용자가 속한 채팅방 조회 
     */
    @Query("SELECT cr FROM ChatRoom cr JOIN cr.members m WHERE m.user = :user")
    List<ChatRoom> findByMember(@Param("user") User user);
    
    /**
     * 워크스페이스 내 사용자가 속한 채팅방 조회
     */
    @Query("SELECT cr FROM ChatRoom cr JOIN cr.members m WHERE m.user = :user AND cr.workspace = :workspace")
    List<ChatRoom> findByWorkspaceAndMember(@Param("workspace") Workspace workspace, @Param("user") User user);
    
    /**
     * 1:1 DM 채팅방 조회 (두 사용자 간)
     */
    @Query("SELECT cr FROM ChatRoom cr " +
           "JOIN cr.members m1 " +
           "JOIN cr.members m2 " +
           "WHERE cr.isDirect = true " +
           "AND cr.workspace = :workspace " +
           "AND m1.user = :user1 AND m2.user = :user2 " +
           "AND size(cr.members) = 2")
    Optional<ChatRoom> findDirectChatRoom(
        @Param("workspace") Workspace workspace,
        @Param("user1") User user1,
        @Param("user2") User user2
    );
} 
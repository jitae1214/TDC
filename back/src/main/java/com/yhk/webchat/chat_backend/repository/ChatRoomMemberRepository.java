package com.yhk.webchat.chat_backend.repository;

import com.yhk.webchat.chat_backend.model.ChatRoom;
import com.yhk.webchat.chat_backend.model.ChatRoomMember;
import com.yhk.webchat.chat_backend.model.ChatRoomMember.ChatRoomMemberId;
import com.yhk.webchat.chat_backend.model.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomMemberRepository extends JpaRepository<ChatRoomMember, ChatRoomMemberId> {
    
    /**
     * 특정 채팅방의 모든 멤버 조회
     */
    List<ChatRoomMember> findByChatRoom(ChatRoom chatRoom);
    
    /**
     * 특정 사용자가 속한 모든 채팅방 멤버십 조회
     */
    List<ChatRoomMember> findByUser(User user);
    
    /**
     * 채팅방 ID로 모든 멤버 조회
     */
    @Query("SELECT cm FROM ChatRoomMember cm WHERE cm.chatRoom.id = :chatRoomId")
    List<ChatRoomMember> findByChatRoomId(@Param("chatRoomId") Long chatRoomId);
    
    /**
     * 사용자 ID로 모든 채팅방 멤버십 조회
     */
    @Query("SELECT cm FROM ChatRoomMember cm WHERE cm.user.id = :userId")
    List<ChatRoomMember> findByUserId(@Param("userId") Long userId);
    
    /**
     * 채팅방 ID와 사용자 ID로 특정 멤버십 조회
     */
    @Query("SELECT cm FROM ChatRoomMember cm WHERE cm.chatRoom.id = :chatRoomId AND cm.user.id = :userId")
    Optional<ChatRoomMember> findByChatRoomIdAndUserId(
            @Param("chatRoomId") Long chatRoomId, 
            @Param("userId") Long userId);
    
    /**
     * 워크스페이스에 속한 모든 채팅방의 멤버십 조회
     */
    @Query("SELECT cm FROM ChatRoomMember cm WHERE cm.chatRoom.workspace.id = :workspaceId")
    List<ChatRoomMember> findByWorkspaceId(@Param("workspaceId") Long workspaceId);
    
    /**
     * 워크스페이스에 속한 특정 사용자의 모든 채팅방 멤버십 조회
     */
    @Query("SELECT cm FROM ChatRoomMember cm WHERE cm.chatRoom.workspace.id = :workspaceId AND cm.user.id = :userId")
    List<ChatRoomMember> findByWorkspaceIdAndUserId(
            @Param("workspaceId") Long workspaceId, 
            @Param("userId") Long userId);
} 
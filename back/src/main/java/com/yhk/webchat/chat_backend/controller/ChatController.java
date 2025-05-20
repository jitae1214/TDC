package com.yhk.webchat.chat_backend.controller;

import com.yhk.webchat.chat_backend.dto.chat.ChatMessage;
import com.yhk.webchat.chat_backend.dto.request.chat.CreateChatRoomRequest;
import com.yhk.webchat.chat_backend.dto.response.ApiResponse;
import com.yhk.webchat.chat_backend.model.User;
import com.yhk.webchat.chat_backend.security.CurrentUser;
import com.yhk.webchat.chat_backend.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 채팅 관련 API 컨트롤러
 */
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * 메시지 전송 (WebSocket)
     * 클라이언트에서 /app/chat.sendMessage로 메시지를 보내면 처리
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        chatService.sendMessage(chatMessage);
    }
    
    /**
     * 채팅방 입장 알림 (WebSocket)
     * 클라이언트에서 /app/chat.addUser로 메시지를 보내면 처리
     */
    @MessageMapping("/chat.addUser")
    public void addUser(@Payload ChatMessage chatMessage) {
        // 채팅방에 입장 메시지 전송
        messagingTemplate.convertAndSend(
            "/topic/chat/" + chatMessage.getChatRoomId(),
            chatMessage
        );
    }
    
    /**
     * 사용자 타이핑 중 이벤트 (WebSocket)
     * 클라이언트에서 /app/chat.typing로 메시지를 보내면 처리
     */
    @MessageMapping("/chat.typing")
    public void typing(@Payload ChatMessage chatMessage) {
        messagingTemplate.convertAndSend(
            "/topic/chat/" + chatMessage.getChatRoomId() + "/typing",
            chatMessage
        );
    }
    
    /**
     * 채팅방 생성 (REST API)
     */
    @PostMapping("/rooms")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> createChatRoom(
            @RequestBody CreateChatRoomRequest request,
            @CurrentUser User currentUser) {
        
        Long userId = currentUser.getId();
        
        ApiResponse response = chatService.createChatRoom(
            request.getWorkspaceId(),
            request.getName(),
            request.getDescription(),
            userId,
            request.getMemberIds(),
            request.isDirect()
        );
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 워크스페이스의 채팅방 목록 조회
     */
    @GetMapping("/rooms/workspace/{workspaceId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> getChatRoomsByWorkspace(
            @PathVariable Long workspaceId,
            @CurrentUser User currentUser) {
        
        Long userId = currentUser.getId();
        
        ApiResponse response = chatService.getChatRoomsByWorkspace(workspaceId, userId);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 채팅방 메시지 목록 조회
     */
    @GetMapping("/rooms/{chatRoomId}/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> getChatMessages(
            @PathVariable Long chatRoomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        ApiResponse response = chatService.getChatMessages(chatRoomId, page, size);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 워크스페이스 ID로 기본 채팅방 조회 또는 생성
     * 프론트엔드에서 워크스페이스 ID를 채팅방 ID로 사용할 때 호환성 제공
     */
    @GetMapping("/rooms/default/workspace/{workspaceId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> getOrCreateDefaultChatRoom(
            @PathVariable Long workspaceId,
            @CurrentUser User currentUser) {
        
        Long userId = currentUser.getId();
        
        ApiResponse response = chatService.getOrCreateDefaultChatRoom(workspaceId, userId);
        
        return ResponseEntity.ok(response);
    }
} 
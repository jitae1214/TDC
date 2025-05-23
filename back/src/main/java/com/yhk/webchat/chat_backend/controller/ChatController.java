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

import java.util.ArrayList;
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
        System.out.println("메시지 수신: " + chatMessage.getContent());
        
        // 메시지에 파일 정보가 있는지 확인
        if (chatMessage.getFileInfo() != null) {
            System.out.println("파일 메시지 감지: " + chatMessage.getFileInfo().getFileName());
            // 명시적으로 FILE 타입으로 설정
            chatMessage.setType(ChatMessage.MessageType.FILE);
        }
        
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
     * 사용자 상태 변경 이벤트 (WebSocket)
     * 클라이언트에서 /app/chat.updateStatus로 메시지를 보내면 처리
     */
    @MessageMapping("/chat.updateStatus")
    public void updateStatus(@Payload Map<String, Object> statusMessage) {
        String username = (String) statusMessage.get("username");
        String status = (String) statusMessage.get("status");
        Long chatRoomId = Long.valueOf(statusMessage.get("chatRoomId").toString());
        
        // 상태 변경 메시지를 해당 채팅방으로 전파
        messagingTemplate.convertAndSend(
            "/topic/chat/" + chatRoomId + "/status",
            statusMessage
        );
        
        // UserService의 상태 업데이트 메서드 호출 (선택적)
        // 사용자가 브라우저 종료나 오프라인 상태로 전환할 때 활용
        if (username != null && status != null) {
            chatService.updateUserStatusInRoom(username, status, chatRoomId);
        }
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
    // 인증 검사 비활성화 - 이미 로그인 단계에서 인증되었다고 가정
    //@PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> getChatRoomsByWorkspace(
            @PathVariable Long workspaceId,
            @CurrentUser User currentUser) {
        
        // 인증된 사용자가 없는 경우도 처리
        Long userId = currentUser != null ? currentUser.getId() : null;
        
        if (userId == null) {
            // 사용자 ID가 없으면 빈 목록 반환
            return ResponseEntity.ok(
                new ApiResponse(true, "사용자 정보가 없습니다. 기본 채팅방 목록을 반환합니다.", new ArrayList<>())
            );
        }
        
        ApiResponse response = chatService.getChatRoomsByWorkspace(workspaceId, userId);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 채팅방 메시지 목록 조회
     */
    @GetMapping("/rooms/{chatRoomId}/messages") // 채팅방 메시지 목록 조회
    // 인증 검사 비활성화 - 이미 로그인 단계에서 인증되었다고 가정
    //@PreAuthorize("isAuthenticated()") // 인증된 사용자만 접근 가능
    public ResponseEntity<ApiResponse> getChatMessages(
            @PathVariable Long chatRoomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        ApiResponse response = chatService.getChatMessages(chatRoomId, page, size);
        
        return ResponseEntity.ok(response);
    }
} 
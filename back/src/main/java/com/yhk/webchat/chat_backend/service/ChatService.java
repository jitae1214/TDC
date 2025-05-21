package com.yhk.webchat.chat_backend.service;

import com.yhk.webchat.chat_backend.dto.chat.ChatMessage;
import com.yhk.webchat.chat_backend.dto.response.ApiResponse;
import com.yhk.webchat.chat_backend.model.ChatRoom;
import com.yhk.webchat.chat_backend.model.User;
import com.yhk.webchat.chat_backend.model.Workspace;
import com.yhk.webchat.chat_backend.repository.ChatMessageRepository;
import com.yhk.webchat.chat_backend.repository.ChatRoomRepository;
import com.yhk.webchat.chat_backend.repository.UserRepository;
import com.yhk.webchat.chat_backend.repository.WorkspaceRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 채팅 관련 비즈니스 로직을 처리하는 서비스
 */
@Service
public class ChatService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private ChatRoomRepository chatRoomRepository;
    
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private WorkspaceRepository workspaceRepository;

    /**
     * 채팅 메시지 전송
     * @param chatMessage 전송할 채팅 메시지
     */
    public void sendMessage(ChatMessage chatMessage) {
        chatMessage.setId(UUID.randomUUID().toString());
        chatMessage.setTimestamp(LocalDateTime.now());
        
        // 채팅방 주제(topic)으로 메시지 전송
        messagingTemplate.convertAndSend(
            "/topic/chat/" + chatMessage.getChatRoomId(),
            chatMessage
        );
        
        // DB에 메시지 저장
        saveChatMessage(chatMessage);
    }
    
    /**
     * 메시지 저장
     * @param message DTO 타입 메시지
     */
    @Transactional
    private void saveChatMessage(ChatMessage message) {
        Optional<ChatRoom> chatRoomOpt = chatRoomRepository.findById(message.getChatRoomId());
        Optional<User> senderOpt = userRepository.findById(message.getSenderId());
        
        if (chatRoomOpt.isPresent() && senderOpt.isPresent()) {
            ChatRoom chatRoom = chatRoomOpt.get();
            User sender = senderOpt.get();
            
            // DTO -> 엔티티 변환
            com.yhk.webchat.chat_backend.model.ChatMessage entity = new com.yhk.webchat.chat_backend.model.ChatMessage();
            entity.setChatRoom(chatRoom);
            entity.setSender(sender);
            entity.setContent(message.getContent());
            entity.setCreatedAt(message.getTimestamp());
            
            // 메시지 타입 변환
            com.yhk.webchat.chat_backend.model.ChatMessage.MessageType entityType;
            switch(message.getType()) {
                case JOIN:
                    entityType = com.yhk.webchat.chat_backend.model.ChatMessage.MessageType.JOIN;
                    break;
                case LEAVE:
                    entityType = com.yhk.webchat.chat_backend.model.ChatMessage.MessageType.LEAVE;
                    break;
                default:
                    entityType = com.yhk.webchat.chat_backend.model.ChatMessage.MessageType.CHAT;
            }
            entity.setType(entityType);
            
            // 메시지 저장
            chatMessageRepository.save(entity);
            
            // 채팅방 최종 활동 시간 업데이트
            chatRoom.updateLastActivity();
            chatRoomRepository.save(chatRoom);
        }
    }
    
    /**
     * 채팅방 생성
     * 
     * @param workspaceId 워크스페이스 ID
     * @param name 채팅방 이름
     * @param description 채팅방 설명
     * @param creatorId 생성자 ID
     * @param memberIds 멤버 ID 목록
     * @param isDirect 1:1 채팅방 여부
     * @return 생성된 채팅방 정보
     */
    @Transactional
    public ApiResponse createChatRoom(Long workspaceId, String name, String description, 
                                     Long creatorId, List<Long> memberIds, boolean isDirect) {
        try {
            Optional<Workspace> workspaceOpt = workspaceRepository.findById(workspaceId);
            Optional<User> creatorOpt = userRepository.findById(creatorId);
            
            if (!workspaceOpt.isPresent()) {
                return new ApiResponse(false, "워크스페이스를 찾을 수 없습니다.", null);
            }
            
            if (!creatorOpt.isPresent()) {
                return new ApiResponse(false, "사용자를 찾을 수 없습니다.", null);
            }
            
            Workspace workspace = workspaceOpt.get();
            User creator = creatorOpt.get();
            
            // 1:1 채팅인 경우 두 명의 사용자만 포함
            if (isDirect && memberIds.size() == 2) {
                // 이미 존재하는 1:1 채팅방 확인
                User user1 = userRepository.findById(memberIds.get(0)).orElse(null);
                User user2 = userRepository.findById(memberIds.get(1)).orElse(null);
                
                if (user1 != null && user2 != null) {
                    Optional<ChatRoom> existingRoom = chatRoomRepository.findDirectChatRoom(workspace, user1, user2);
                    
                    if (existingRoom.isPresent()) {
                        Map<String, Object> data = new HashMap<>();
                        data.put("chatRoomId", existingRoom.get().getId());
                        data.put("message", "이미 존재하는 1:1 채팅방입니다.");
                        return new ApiResponse(true, "이미 존재하는 1:1 채팅방입니다.", data);
                    }
                }
            }
            
            // 채팅방 생성
            ChatRoom chatRoom = new ChatRoom();
            chatRoom.setName(name);
            chatRoom.setDescription(description);
            chatRoom.setWorkspace(workspace);
            chatRoom.setCreator(creator);
            chatRoom.setDirect(isDirect);
            chatRoom.addMember(creator); // 생성자를 멤버로 추가
            
            // 멤버 추가
            if (memberIds != null && !memberIds.isEmpty()) {
                for (Long memberId : memberIds) {
                    Optional<User> memberOpt = userRepository.findById(memberId);
                    memberOpt.ifPresent(chatRoom::addMember);
                }
            }
            
            ChatRoom savedChatRoom = chatRoomRepository.save(chatRoom);
            
            // 시스템 메시지 (채팅방 생성) 추가
            com.yhk.webchat.chat_backend.model.ChatMessage systemMessage = new com.yhk.webchat.chat_backend.model.ChatMessage();
            systemMessage.setChatRoom(savedChatRoom);
            systemMessage.setSender(creator);
            systemMessage.setContent(creator.getUsername() + "님이 채팅방을 생성했습니다.");
            systemMessage.setType(com.yhk.webchat.chat_backend.model.ChatMessage.MessageType.SYSTEM);
            chatMessageRepository.save(systemMessage);
            
            // 응답 데이터 구성
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("chatRoomId", savedChatRoom.getId());
            responseData.put("name", savedChatRoom.getName());
            responseData.put("description", savedChatRoom.getDescription());
            responseData.put("createdAt", savedChatRoom.getCreatedAt());
            responseData.put("creatorId", creator.getId());
            responseData.put("isDirect", savedChatRoom.isDirect());
            
            return new ApiResponse(true, "채팅방이 생성되었습니다.", responseData);
        } catch (Exception e) {
            return new ApiResponse(false, "채팅방 생성 중 오류가 발생했습니다: " + e.getMessage(), null);
        }
    }
    
    /**
     * 채팅방 메시지 조회
     * 
     * @param chatRoomId 채팅방 ID
     * @param page 페이지 번호
     * @param size 페이지 크기
     * @return 메시지 목록
     */
    public ApiResponse getChatMessages(Long chatRoomId, int page, int size) {
        try {
            Optional<ChatRoom> chatRoomOpt = chatRoomRepository.findById(chatRoomId);
            
            if (!chatRoomOpt.isPresent()) {
                return new ApiResponse(false, "채팅방을 찾을 수 없습니다.", null);
            }
            
            ChatRoom chatRoom = chatRoomOpt.get();
            
            // 페이지네이션 처리
            PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<com.yhk.webchat.chat_backend.model.ChatMessage> messages = 
                chatMessageRepository.findByChatRoomOrderByCreatedAtDesc(chatRoom, pageRequest);
            
            // 엔티티 -> DTO 변환
            List<ChatMessage> messageDtos = messages.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
            
            // 응답 데이터 구성
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("messages", messageDtos);
            responseData.put("currentPage", messages.getNumber());
            responseData.put("totalItems", messages.getTotalElements());
            responseData.put("totalPages", messages.getTotalPages());
            
            return new ApiResponse(true, "채팅 메시지를 성공적으로 조회했습니다.", responseData);
        } catch (Exception e) {
            return new ApiResponse(false, "채팅 메시지 조회 중 오류가 발생했습니다: " + e.getMessage(), null);
        }
    }
    
    /**
     * 엔티티를 DTO로 변환
     */
    private ChatMessage convertToDto(com.yhk.webchat.chat_backend.model.ChatMessage entity) {
        User sender = entity.getSender();
        
        ChatMessage dto = new ChatMessage();
        dto.setId(entity.getId().toString());
        dto.setChatRoomId(entity.getChatRoom().getId());
        dto.setSenderId(sender.getId());
        dto.setSenderName(sender.getUsername());
        dto.setContent(entity.getContent());
        dto.setTimestamp(entity.getCreatedAt());
        dto.setSenderProfileUrl(sender.getProfileImageUrl());
        
        // 타입 변환
        switch(entity.getType()) {
            case JOIN:
                dto.setType(ChatMessage.MessageType.JOIN);
                break;
            case LEAVE:
                dto.setType(ChatMessage.MessageType.LEAVE);
                break;
            case SYSTEM:
                dto.setType(ChatMessage.MessageType.CHAT); // 시스템 메시지는 일반 채팅으로 표시
                break;
            default:
                dto.setType(ChatMessage.MessageType.CHAT);
        }
        
        return dto;
    }
    
    /**
     * 워크스페이스의 채팅방 목록 조회
     * 
     * @param workspaceId 워크스페이스 ID
     * @param userId 사용자 ID (멤버 필터링용)
     * @return 채팅방 목록
     */
    public ApiResponse getChatRoomsByWorkspace(Long workspaceId, Long userId) {
        try {
            Optional<Workspace> workspaceOpt = workspaceRepository.findById(workspaceId);
            Optional<User> userOpt = userRepository.findById(userId);
            
            if (!workspaceOpt.isPresent()) {
                return new ApiResponse(false, "워크스페이스를 찾을 수 없습니다.", null);
            }
            
            if (!userOpt.isPresent()) {
                return new ApiResponse(false, "사용자를 찾을 수 없습니다.", null);
            }
            
            Workspace workspace = workspaceOpt.get();
            User user = userOpt.get();
            
            // 사용자가 속한 채팅방 목록 조회
            List<ChatRoom> chatRooms = chatRoomRepository.findByWorkspaceAndMember(workspace, user);
            
            // 채팅방 정보 구성
            List<Map<String, Object>> chatRoomData = new ArrayList<>();
            
            for (ChatRoom room : chatRooms) {
                Map<String, Object> roomInfo = new HashMap<>();
                roomInfo.put("id", room.getId());
                roomInfo.put("name", room.getName());
                roomInfo.put("description", room.getDescription());
                roomInfo.put("createdAt", room.getCreatedAt());
                roomInfo.put("updatedAt", room.getUpdatedAt());
                roomInfo.put("isDirect", room.isDirect());
                
                // 멤버 정보
                List<Map<String, Object>> memberInfo = new ArrayList<>();
                for (User member : room.getMembers()) {
                    Map<String, Object> memberData = new HashMap<>();
                    memberData.put("id", member.getId());
                    memberData.put("username", member.getUsername());
                    memberData.put("profileImageUrl", member.getProfileImageUrl());
                    memberInfo.add(memberData);
                }
                roomInfo.put("members", memberInfo);
                
                // 마지막 메시지 정보
                com.yhk.webchat.chat_backend.model.ChatMessage lastMessage = 
                    chatMessageRepository.findTopByChatRoomOrderByCreatedAtDesc(room);
                if (lastMessage != null) {
                    Map<String, Object> lastMessageInfo = new HashMap<>();
                    lastMessageInfo.put("content", lastMessage.getContent());
                    lastMessageInfo.put("senderId", lastMessage.getSender().getId());
                    lastMessageInfo.put("senderName", lastMessage.getSender().getUsername());
                    lastMessageInfo.put("timestamp", lastMessage.getCreatedAt());
                    roomInfo.put("lastMessage", lastMessageInfo);
                }
                
                // 읽지 않은 메시지 수
                long unreadCount = chatMessageRepository.countUnreadMessages(room, user);
                roomInfo.put("unreadMessageCount", unreadCount);
                
                chatRoomData.add(roomInfo);
            }
            
            return new ApiResponse(true, "채팅방 목록을 성공적으로 조회했습니다.", chatRoomData);
        } catch (Exception e) {
            return new ApiResponse(false, "채팅방 목록 조회 중 오류가 발생했습니다: " + e.getMessage(), null);
        }
    }

    /**
     * 워크스페이스의 모든 채팅방에 사용자 추가
     * 
     * @param workspaceId 워크스페이스 ID
     * @param userId 추가할 사용자 ID
     * @return 성공 여부
     */
    @Transactional
    public boolean addUserToWorkspaceChannels(Long workspaceId, Long userId) {
        try {
            Optional<Workspace> workspaceOpt = workspaceRepository.findById(workspaceId);
            Optional<User> userOpt = userRepository.findById(userId);
            
            if (!workspaceOpt.isPresent() || !userOpt.isPresent()) {
                return false;
            }
            
            Workspace workspace = workspaceOpt.get();
            User user = userOpt.get();
            
            // 워크스페이스의 모든 채팅방 조회
            List<ChatRoom> chatRooms = chatRoomRepository.findByWorkspace(workspace);
            
            // 1:1 채팅방이 아닌 일반 채팅방에만 사용자 추가
            for (ChatRoom chatRoom : chatRooms) {
                if (!chatRoom.isDirect() && !chatRoom.getMembers().contains(user)) {
                    chatRoom.addMember(user);
                    chatRoomRepository.save(chatRoom);
                    
                    // 시스템 메시지 추가 (사용자 입장)
                    com.yhk.webchat.chat_backend.model.ChatMessage systemMessage = new com.yhk.webchat.chat_backend.model.ChatMessage();
                    systemMessage.setChatRoom(chatRoom);
                    systemMessage.setSender(user);
                    systemMessage.setContent(user.getUsername() + "님이 채팅방에 참여했습니다.");
                    systemMessage.setType(com.yhk.webchat.chat_backend.model.ChatMessage.MessageType.JOIN);
                    chatMessageRepository.save(systemMessage);
                }
            }
            
            return true;
        } catch (Exception e) {
            return false;
        }
    }
} 
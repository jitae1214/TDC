package com.yhk.webchat.chat_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import com.yhk.webchat.chat_backend.dto.response.ApiResponse;
import com.yhk.webchat.chat_backend.model.User;
import com.yhk.webchat.chat_backend.model.Workspace;
import com.yhk.webchat.chat_backend.model.ChatRoomMember;
import com.yhk.webchat.chat_backend.model.WorkspaceMembership;
import com.yhk.webchat.chat_backend.repository.UserRepository;
import com.yhk.webchat.chat_backend.repository.WorkspaceMembershipRepository;
import com.yhk.webchat.chat_backend.repository.WorkspaceRepository;
import com.yhk.webchat.chat_backend.repository.ChatRoomMemberRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 사용자 관련 비즈니스 로직을 담당하는 서비스
 */
@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private WorkspaceRepository workspaceRepository;
    
    @Autowired
    private WorkspaceMembershipRepository workspaceMembershipRepository;
    
    @Autowired
    private ChatRoomMemberRepository chatRoomMemberRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    // 상태 상수 정의
    public static final String STATUS_ONLINE = "ONLINE";
    public static final String STATUS_OFFLINE = "OFFLINE";
    public static final String STATUS_AWAY = "AWAY";
    
    /**
     * 사용자 프로필 이미지 URL 업데이트
     * @param userId 사용자 ID
     * @param imageUrl 이미지 URL
     * @return 업데이트 결과
     */
    @Transactional
    public ApiResponse updateProfileImage(Long userId, String imageUrl) {
        try {
            // 사용자 조회
            Optional<User> optionalUser = userRepository.findById(userId);
            if (!optionalUser.isPresent()) {
                return new ApiResponse(false, "사용자를 찾을 수 없습니다.", null);
            }
            
            User user = optionalUser.get();
            
            // 프로필 이미지 URL 업데이트
            user.setProfileImageUrl(imageUrl);
            user.setUpdatedAt(LocalDateTime.now());
            
            userRepository.save(user);
            
            // 응답 데이터 구성
            Map<String, Object> data = new HashMap<>();
            data.put("userId", user.getId());
            data.put("username", user.getUsername());
            data.put("profileImageUrl", user.getProfileImageUrl());
            
            return new ApiResponse(true, "프로필 이미지가 업데이트되었습니다.", data);
        } catch (Exception e) {
            return new ApiResponse(false, "프로필 이미지 업데이트 중 오류가 발생했습니다: " + e.getMessage(), null);
        }
    }

    /**
     * @param username 
     * @param imageUrl 
     * @return 
     */
    @Transactional
    public ApiResponse updateProfileImageByUsername(String username, String imageUrl) {
        try {
            // uc0acuc6a9uc790 uc774ub984uc73cub85c uc0acuc6a9uc790 uc870ud68c
            Optional<User> optionalUser = userRepository.findByUsername(username);
            if (!optionalUser.isPresent()) {
                return new ApiResponse(false, "uc0acuc6a9uc790ub97c ucc3euc744 uc218 uc5c6uc2b5ub2c8ub2e4.", null);
            }
            
            User user = optionalUser.get();
            
            // ud504ub85cud544 uc774ubbf8uc9c0 URL uc5c5ub370uc774ud2b8
            user.setProfileImageUrl(imageUrl);
            user.setUpdatedAt(LocalDateTime.now());
            
            userRepository.save(user);
            
            // uc751ub2f5 ub370uc774ud130 uad6cuc131
            Map<String, Object> data = new HashMap<>();
            data.put("userId", user.getId());
            data.put("username", user.getUsername());
            data.put("profileImageUrl", user.getProfileImageUrl());
            
            return new ApiResponse(true, "ud504ub85cud544 uc774ubbf8uc9c0uac00 uc5c5ub370uc774ud2b8ub418uc5c8uc2b5ub2c8ub2e4.", data);
        } catch (Exception e) {
            return new ApiResponse(false, "ud504ub85cud544 uc774ubbf8uc9c0 uc5c5ub370uc774ud2b8 uc911 uc624ub958uac00 ubc1cuc0ddud588uc2b5ub2c8ub2e4: " + e.getMessage(), null);
        }
    }
    
    /**
     * 사용자 온라인 상태 업데이트
     * @param userId 사용자 ID
     * @param status 상태 (ONLINE, OFFLINE, AWAY)
     * @return 업데이트 결과
     */
    @Transactional
    public ApiResponse updateUserStatus(Long userId, String status) {
        try {
            // 사용자 조회
            Optional<User> optionalUser = userRepository.findById(userId);
            if (!optionalUser.isPresent()) {
                return new ApiResponse(false, "사용자를 찾을 수 없습니다.", null);
            }
            
            User user = optionalUser.get();
            
            // 상태값 검증
            if (!status.equals(STATUS_ONLINE) && !status.equals(STATUS_OFFLINE) && !status.equals(STATUS_AWAY)) {
                return new ApiResponse(false, "잘못된 상태값입니다. (ONLINE, OFFLINE, AWAY 중 하나여야 함)", null);
            }
            
            // 이전 상태와 동일하면 변경하지 않음
            if (status.equals(user.getStatus())) {
                Map<String, Object> data = new HashMap<>();
                data.put("userId", user.getId());
                data.put("username", user.getUsername());
                data.put("status", user.getStatus());
                data.put("lastLoginAt", user.getLastLoginAt());
                return new ApiResponse(true, "사용자 상태가 이미 " + status + " 상태입니다.", data);
            }
            
            // 사용자 상태 업데이트 (연관된 모든 채팅방 멤버 상태도 함께 업데이트)
            user.updateStatus(status);
            
            // 로그인 시간 업데이트 (온라인 상태로 변경 시)
            if (status.equals(STATUS_ONLINE)) {
                user.setLastLoginAt(LocalDateTime.now());
            }
            
            userRepository.save(user);
            
            // 상태 변경 이벤트를 웹소켓으로 전파
            broadcastStatusChange(user);
            
            // 응답 데이터 구성
            Map<String, Object> data = new HashMap<>();
            data.put("userId", user.getId());
            data.put("username", user.getUsername());
            data.put("status", user.getStatus());
            data.put("lastLoginAt", user.getLastLoginAt());
            
            return new ApiResponse(true, "사용자 상태가 업데이트되었습니다.", data);
        } catch (Exception e) {
            return new ApiResponse(false, "사용자 상태 업데이트 중 오류가 발생했습니다: " + e.getMessage(), null);
        }
    }
    
    /**
     * 사용자 상태 변경을 실시간으로 전파
     * @param user 상태가 변경된 사용자
     */
    private void broadcastStatusChange(User user) {
        // 1. 상태 변경 정보 생성
        Map<String, Object> statusUpdate = new HashMap<>();
        statusUpdate.put("userId", user.getId());
        statusUpdate.put("username", user.getUsername());
        statusUpdate.put("status", user.getStatus());
        statusUpdate.put("timestamp", LocalDateTime.now());
        
        // 2. 사용자가 속한 모든 채팅방으로 상태 변경 전파
        List<ChatRoomMember> memberships = chatRoomMemberRepository.findByUser(user);
        for (ChatRoomMember membership : memberships) {
            Long chatRoomId = membership.getChatRoom().getId();
            // 채팅방별 상태 업데이트 메시지 전송
            messagingTemplate.convertAndSend("/topic/chat/" + chatRoomId + "/status", statusUpdate);
        }
        
        // 3. 사용자가 속한 모든 워크스페이스로 상태 변경 전파
        List<WorkspaceMembership> workspaceMemberships = workspaceMembershipRepository.findByUser(user);
        for (WorkspaceMembership workspaceMembership : workspaceMemberships) {
            Long workspaceId = workspaceMembership.getWorkspace().getId();
            // 워크스페이스별 상태 업데이트 메시지 전송
            messagingTemplate.convertAndSend("/topic/workspace/" + workspaceId + "/status", statusUpdate);
        }
        
        // 4. 전체 사용자 상태 업데이트 주제로도 전송
        messagingTemplate.convertAndSend("/topic/users/status", statusUpdate);
    }
    
    /**
     * 사용자 상태를 username으로 업데이트
     * @param username 사용자 이름
     * @param status 상태 (ONLINE, OFFLINE, AWAY)
     * @return 업데이트 결과
     */
    @Transactional
    public ApiResponse updateUserStatusByUsername(String username, String status) {
        try {
            // 사용자 조회
            Optional<User> optionalUser = userRepository.findByUsername(username);
            if (!optionalUser.isPresent()) {
                return new ApiResponse(false, "사용자를 찾을 수 없습니다: " + username, null);
            }
            
            User user = optionalUser.get();
            
            // 상태값 검증
            if (!status.equals(STATUS_ONLINE) && !status.equals(STATUS_OFFLINE) && !status.equals(STATUS_AWAY)) {
                return new ApiResponse(false, "잘못된 상태값입니다. (ONLINE, OFFLINE, AWAY 중 하나여야 함)", null);
            }
            
            // 이전 상태와 동일하면 변경하지 않음
            if (status.equals(user.getStatus())) {
                Map<String, Object> data = new HashMap<>();
                data.put("userId", user.getId());
                data.put("username", user.getUsername());
                data.put("status", user.getStatus());
                data.put("lastLoginAt", user.getLastLoginAt());
                return new ApiResponse(true, "사용자 상태가 이미 " + status + " 상태입니다.", data);
            }
            
            // 사용자 상태 업데이트
            user.updateStatus(status);
            
            // 로그인 시간 업데이트 (온라인 상태로 변경 시)
            if (status.equals(STATUS_ONLINE)) {
                user.setLastLoginAt(LocalDateTime.now());
            }
            
            userRepository.save(user);
            
            // 상태 변경 이벤트를 웹소켓으로 전파
            broadcastStatusChange(user);
            
            // 응답 데이터 구성
            Map<String, Object> data = new HashMap<>();
            data.put("userId", user.getId());
            data.put("username", user.getUsername());
            data.put("status", user.getStatus());
            data.put("lastLoginAt", user.getLastLoginAt());
            
            return new ApiResponse(true, "사용자 상태가 업데이트되었습니다.", data);
        } catch (Exception e) {
            return new ApiResponse(false, "사용자 상태 업데이트 중 오류가 발생했습니다: " + e.getMessage(), null);
        }
    }
    
    /**
     * 모든 온라인 사용자 목록 조회
     * @return 온라인 사용자 ID 목록
     */
    public List<Long> getAllOnlineUsers() {
        List<User> onlineUsers = userRepository.findByStatus(STATUS_ONLINE);
        return onlineUsers.stream().map(User::getId).collect(Collectors.toList());
    }
    
    /**
     * 워크스페이스에 속한 온라인 사용자 목록 조회
     * @param workspaceId 워크스페이스 ID
     * @return 온라인 사용자 ID 목록
     */
    public List<Long> getWorkspaceOnlineMembers(Long workspaceId) {
        try {
            // 워크스페이스 존재 확인
            Optional<Workspace> optionalWorkspace = workspaceRepository.findById(workspaceId);
            if (!optionalWorkspace.isPresent()) {
                return new ArrayList<>();
            }
            
            // 워크스페이스 멤버십 조회
            List<WorkspaceMembership> memberships = workspaceMembershipRepository.findByWorkspaceId(workspaceId);
            
            // 멤버십에 속한 사용자 중 온라인 상태인 사용자 필터링
            List<Long> onlineUserIds = new ArrayList<>();
            for (WorkspaceMembership membership : memberships) {
                User user = membership.getUser();
                if (user != null && STATUS_ONLINE.equals(user.getStatus())) {
                    onlineUserIds.add(user.getId());
                }
            }
            
            return onlineUserIds;
        } catch (Exception e) {
            // 오류 발생 시 빈 목록 반환
            return new ArrayList<>();
        }
    }
    
    /**
     * 특정 사용자의 온라인 상태 조회
     * @param userId 사용자 ID
     * @return 온라인 상태 문자열 (ONLINE, OFFLINE, AWAY)
     */
    public String getUserStatus(Long userId) {
        try {
            Optional<User> optionalUser = userRepository.findById(userId);
            if (optionalUser.isPresent()) {
                return optionalUser.get().getStatus();
            }
            return STATUS_OFFLINE;
        } catch (Exception e) {
            return STATUS_OFFLINE;
        }
    }
} 
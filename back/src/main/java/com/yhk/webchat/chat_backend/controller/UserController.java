package com.yhk.webchat.chat_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import com.yhk.webchat.chat_backend.dto.request.user.UpdateProfileImageRequest;
import com.yhk.webchat.chat_backend.dto.request.user.UpdateUserStatusRequest;
import com.yhk.webchat.chat_backend.dto.response.ApiResponse;
import com.yhk.webchat.chat_backend.model.User;
import com.yhk.webchat.chat_backend.security.CurrentUser;
import com.yhk.webchat.chat_backend.service.UserService;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

/**
 * 사용자 관련 API 컨트롤러
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * 현재 로그인한 사용자의 프로필 이미지 URL 업데이트
     * @param updateRequest 프로필 이미지 업데이트 요청
     * @param currentUser 현재 로그인한 사용자
     * @return 업데이트 결과
     */
    @PostMapping("/profile-image")
    public ResponseEntity<ApiResponse> updateProfileImage(
            @RequestBody UpdateProfileImageRequest updateRequest,
            @CurrentUser User currentUser) {
        
        ApiResponse response;
        try {
            // uc0acuc6a9uc790 ucc3eub294 ubc29ubc95
            if (currentUser != null) {
                // uc778uc99dub41c uc0acuc6a9uc790uac00 uc788ub294 uacbduacbd
                response = userService.updateProfileImage(currentUser.getId(), updateRequest.getImageUrl());
            } else if (updateRequest.getUserId() != null) {
                // uc9c0uc815ub41c userId uac12uc73cub85c ucc3eub294 uacbduacbd
                response = userService.updateProfileImage(updateRequest.getUserId(), updateRequest.getImageUrl());
            } else if (updateRequest.getUsername() != null) {
                // uc9c0uc815ub41c username uc73cub85c ucc3eub294 uacbduacbd
                response = userService.updateProfileImageByUsername(updateRequest.getUsername(), updateRequest.getImageUrl());
            } else {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "uc0acuc6a9uc790 uc815ubcf4uac00 uc5c6uc2b5ub2c8ub2e4.", null));
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "ud504ub85cud544 uc774ubbf8uc9c0 uc5c5ub370uc774ud2b8 uc911 uc624ub958: " + e.getMessage(), null));
        }
    }
    
    /**
     * 사용자 상태 업데이트
     */
    @PutMapping("/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> updateUserStatus(
            @RequestBody Map<String, String> statusRequest,
            @CurrentUser User currentUser) {
        
        String status = statusRequest.get("status");
        
        if (status == null) {
            return ResponseEntity.badRequest().body(
                new ApiResponse(false, "상태값이 제공되지 않았습니다.", null)
            );
        }
        
        ApiResponse response = userService.updateUserStatus(currentUser.getId(), status);
        
            return ResponseEntity.ok(response);
    }
    
    /**
     * 특정 사용자의 상태 조회
     */
    @GetMapping("/{userId}/status")
    public ResponseEntity<ApiResponse> getUserStatus(@PathVariable Long userId) {
        String status = userService.getUserStatus(userId);
        
        if (status == null) {
            return ResponseEntity.notFound().build();
        }
        
        Map<String, Object> data = new HashMap<>();
        data.put("userId", userId);
        data.put("status", status);
        
        return ResponseEntity.ok(new ApiResponse(true, "사용자 상태 조회 성공", data));
    }
    
    /**
     * 워크스페이스의 온라인 사용자 목록 조회
     */
    @GetMapping("/workspace/{workspaceId}/online")
    public ResponseEntity<ApiResponse> getWorkspaceOnlineUsers(@PathVariable Long workspaceId) {
        List<Long> onlineUserIds = userService.getWorkspaceOnlineMembers(workspaceId);
        
        Map<String, Object> data = new HashMap<>();
        data.put("workspaceId", workspaceId);
        data.put("onlineUserIds", onlineUserIds);
        
        return ResponseEntity.ok(new ApiResponse(true, "워크스페이스 온라인 사용자 목록 조회 성공", data));
    }
    
    /**
     * 온라인 상태인 사용자 목록 조회
     * @return 온라인 사용자 ID 목록
     */
    @GetMapping("/online")
    public ResponseEntity<List<Long>> getOnlineUsers() {
        List<Long> onlineUsers = userService.getAllOnlineUsers();
        return ResponseEntity.ok(onlineUsers);
    }
    
    /**
     * 특정 워크스페이스의 온라인 멤버 목록 조회
     * @param workspaceId 워크스페이스 ID
     * @return 온라인 멤버 ID 목록
     */
    @GetMapping("/workspaces/{workspaceId}/online-members")
    public ResponseEntity<List<Long>> getWorkspaceOnlineMembers(@PathVariable Long workspaceId) {
        List<Long> onlineMembers = userService.getWorkspaceOnlineMembers(workspaceId);
        return ResponseEntity.ok(onlineMembers);
    }
} 
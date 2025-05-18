package com.yhk.webchat.chat_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.yhk.webchat.chat_backend.dto.request.user.UpdateProfileImageRequest;
import com.yhk.webchat.chat_backend.dto.response.ApiResponse;
import com.yhk.webchat.chat_backend.model.User;
import com.yhk.webchat.chat_backend.security.CurrentUser;
import com.yhk.webchat.chat_backend.service.UserService;

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
} 
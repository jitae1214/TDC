package com.yhk.webchat.chat_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yhk.webchat.chat_backend.dto.response.ApiResponse;
import com.yhk.webchat.chat_backend.model.User;
import com.yhk.webchat.chat_backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * 사용자 관련 비즈니스 로직을 담당하는 서비스
 */
@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
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
     * uc0acuc6a9uc790uba85uc73cub85c ud504ub85cud544 uc774ubbf8uc9c0 URL uc5c5ub370uc774ud2b8
     * @param username uc0acuc6a9uc790 uc774ub984
     * @param imageUrl uc774ubbf8uc9c0 URL
     * @return uc5c5ub370uc774ud2b8 uacb0uacfc
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
} 
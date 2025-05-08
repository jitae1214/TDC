package com.yhk.webchat.chat_backend.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * 보안 관련 유틸리티 메서드 모음
 */
@Component
public class SecurityUtil {

    /**
     * 현재 인증된 사용자의 이름(username) 반환
     * @return 사용자 이름을 담은 Optional 객체
     */
    public static Optional<String> getCurrentUsername() {
        // SecurityContext에서 인증 정보 가져오기
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        Object principal = authentication.getPrincipal();
        
        // 인증 객체의 타입에 따라 사용자 이름 추출
        if (principal instanceof UserDetails) {
            return Optional.of(((UserDetails) principal).getUsername());
        } else if (principal instanceof String) {
            return Optional.of((String) principal);
        }
        
        return Optional.empty();
    }
} 
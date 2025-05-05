package com.yhk.webchat.chat_backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 소셜 로그인에서 얻은 사용자 정보를 담는 모델
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SocialUserInfo {
    
    // 소셜 서비스 ID
    private String socialId;
    
    // 이메일
    private String email;
    
    // 닉네임 또는 이름
    private String name;
    
    // 프로필 이미지 URL
    private String profileImageUrl;
    
    // 소셜 서비스 제공자 (kakao, naver, google)
    private String provider;
} 
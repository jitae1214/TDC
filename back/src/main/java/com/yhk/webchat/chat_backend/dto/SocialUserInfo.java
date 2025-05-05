package com.yhk.webchat.chat_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

/**
 * 소셜 로그인에서 얻은 사용자 정보를 담는 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SocialUserInfo {
    
    // 소셜 서비스 ID
    private String socialId;
    
    // 소셜 서비스 제공자 (kakao, naver, google)
    private String provider;
    
    // 이메일
    private String email;
    
    // 닉네임 또는 이름
    private String nickname;
    
    // 프로필 이미지 URL
    private String profileImage;
    
    // 추가 정보
    private Map<String, Object> additionalInfo = new HashMap<>();
    
    // 추가 정보 없는 생성자
    public SocialUserInfo(String socialId, String provider, String email, String nickname, String profileImage) {
        this.socialId = socialId;
        this.provider = provider;
        this.email = email;
        this.nickname = nickname;
        this.profileImage = profileImage;
    }
} 
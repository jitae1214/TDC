package com.yhk.webchat.chat_backend.dto;

import java.util.HashMap;
import java.util.Map;

/**
 * 소셜 로그인에서 얻은 사용자 정보를 담는 DTO
 */
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
    
    // 기본 생성자
    public SocialUserInfo() {
    }
    
    // 모든 필드 생성자
    public SocialUserInfo(String socialId, String provider, String email, String nickname, String profileImage, Map<String, Object> additionalInfo) {
        this.socialId = socialId;
        this.provider = provider;
        this.email = email;
        this.nickname = nickname;
        this.profileImage = profileImage;
        this.additionalInfo = additionalInfo;
    }
    
    // 추가 정보 없는 생성자
    public SocialUserInfo(String socialId, String provider, String email, String nickname, String profileImage) {
        this.socialId = socialId;
        this.provider = provider;
        this.email = email;
        this.nickname = nickname;
        this.profileImage = profileImage;
    }
    
    // Getter 및 Setter 메서드
    public String getSocialId() {
        return socialId;
    }
    
    public void setSocialId(String socialId) {
        this.socialId = socialId;
    }
    
    public String getProvider() {
        return provider;
    }
    
    public void setProvider(String provider) {
        this.provider = provider;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getNickname() {
        return nickname;
    }
    
    public void setNickname(String nickname) {
        this.nickname = nickname;
    }
    
    public String getProfileImage() {
        return profileImage;
    }
    
    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }
    
    public Map<String, Object> getAdditionalInfo() {
        return additionalInfo;
    }
    
    public void setAdditionalInfo(Map<String, Object> additionalInfo) {
        this.additionalInfo = additionalInfo;
    }
} 
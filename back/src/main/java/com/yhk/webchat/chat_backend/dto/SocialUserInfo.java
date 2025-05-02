package com.yhk.webchat.chat_backend.dto;

import java.util.Map;

/**
 * 소셜 로그인 사용자 정보 DTO
 */
public class SocialUserInfo {

    private String socialId;
    private String provider;
    private String email;
    private String nickname;
    private String profileImage;
    private Map<String, Object> additionalInfo;

    // 기본 생성자
    public SocialUserInfo() {
    }

    // 필수 필드 생성자
    public SocialUserInfo(String socialId, String provider) {
        this.socialId = socialId;
        this.provider = provider;
    }

    // 모든 필드 생성자
    public SocialUserInfo(String socialId, String provider, String email, String nickname,
                          String profileImage, Map<String, Object> additionalInfo) {
        this.socialId = socialId;
        this.provider = provider;
        this.email = email;
        this.nickname = nickname;
        this.profileImage = profileImage;
        this.additionalInfo = additionalInfo;
    }

    // Getter 및 Setter
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

    @Override
    public String toString() {
        return "SocialUserInfo{" +
                "socialId='" + socialId + '\'' +
                ", provider='" + provider + '\'' +
                ", email='" + email + '\'' +
                ", nickname='" + nickname + '\'' +
                ", profileImage='" + profileImage + '\'' +
                '}';
    }
} 
package com.yhk.webchat.chat_backend.dto.request.auth;

/**
 * 회원가입 요청 DTO
 * 사용자 회원가입 시 필요한 정보를 담고 있음
 */
public class RegisterRequest {
    private String username;      // 사용자 아이디
    private String password;      // 비밀번호
    private String email;         // 이메일
    private String fullName;      // 이름 (실명)
    private String nickname;      // 닉네임 (선택)
    private String profileImage;  // 프로필 이미지 URL (선택)
    private boolean agreeToTerms; // 이용약관 동의 여부

    // 기본 생성자
    public RegisterRequest() {
    }

    // 모든 필드를 포함한 생성자
    public RegisterRequest(String username, String password, String email, String fullName, 
                          String nickname, String profileImage, boolean agreeToTerms) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.fullName = fullName;
        this.nickname = nickname;
        this.profileImage = profileImage;
        this.agreeToTerms = agreeToTerms;
    }

    // Getter 및 Setter 메서드
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
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

    public boolean isAgreeToTerms() {
        return agreeToTerms;
    }

    public void setAgreeToTerms(boolean agreeToTerms) {
        this.agreeToTerms = agreeToTerms;
    }
} 
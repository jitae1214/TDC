package com.yhk.webchat.chat_backend.dto.request.user;

/**
 * ud504ub85cud544 uc774ubbf8uc9c0 URL uc5c5ub370uc774ud2b8 uc694uccad DTO
 */
public class UpdateProfileImageRequest {
    
    private String imageUrl;
    private Long userId;
    private String username;
    
    // uae30ubcf8 uc0dduc131uc790
    public UpdateProfileImageRequest() {
    }
    
    // ubaa8ub4e0 ud544ub4dc uc0dduc131uc790
    public UpdateProfileImageRequest(String imageUrl, Long userId, String username) {
        this.imageUrl = imageUrl;
        this.userId = userId;
        this.username = username;
    }
    
    // Getter/Setter
    public String getImageUrl() {
        return imageUrl;
    }
    
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
} 
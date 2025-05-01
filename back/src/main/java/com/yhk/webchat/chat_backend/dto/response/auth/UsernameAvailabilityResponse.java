package com.yhk.webchat.chat_backend.dto.response.auth;

/**
 * 아이디 중복 확인 응답 DTO
 * 아이디 중복 확인 결과 정보를 담고 있음
 */
public class UsernameAvailabilityResponse {
    private boolean available;  // 사용 가능 여부
    private String message;     // 결과 메시지
    
    // 기본 생성자
    public UsernameAvailabilityResponse() {
    }
    
    // 간단한 응답 생성자
    public UsernameAvailabilityResponse(boolean available) {
        this.available = available;
        this.message = available ? 
                      "사용 가능한 아이디입니다." : 
                      "이미 사용 중인 아이디입니다.";
    }
    
    // 모든 필드를 포함한 생성자
    public UsernameAvailabilityResponse(boolean available, String message) {
        this.available = available;
        this.message = message;
    }
    
    // Getter 및 Setter 메서드
    public boolean isAvailable() {
        return available;
    }
    
    public void setAvailable(boolean available) {
        this.available = available;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
} 
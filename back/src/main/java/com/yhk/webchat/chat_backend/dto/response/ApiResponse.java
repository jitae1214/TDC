package com.yhk.webchat.chat_backend.dto.response;

/**
 * 기본 API 응답 형식
 */
public class ApiResponse {
    
    private boolean success;
    private String message;
    private Object data;
    
    /**
     * 기본 생성자
     */
    public ApiResponse() {
    }
    
    /**
     * 성공/실패 여부와 메시지만 있는 생성자
     * @param success 성공 여부
     * @param message 응답 메시지
     */
    public ApiResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
    
    /**
     * 모든 필드를 포함한 생성자
     * @param success 성공 여부
     * @param message 응답 메시지
     * @param data 응답 데이터
     */
    public ApiResponse(boolean success, String message, Object data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }
    
    /**
     * 성공 응답 생성 메서드
     * @param message 응답 메시지
     * @return 성공 응답
     */
    public static ApiResponse success(String message) {
        return new ApiResponse(true, message);
    }
    
    /**
     * 데이터를 포함한 성공 응답 생성 메서드
     * @param message 응답 메시지
     * @param data 응답 데이터
     * @return 성공 응답
     */
    public static ApiResponse success(String message, Object data) {
        return new ApiResponse(true, message, data);
    }
    
    /**
     * 실패 응답 생성 메서드
     * @param message 응답 메시지
     * @return 실패 응답
     */
    public static ApiResponse error(String message) {
        return new ApiResponse(false, message);
    }
    
    /**
     * 데이터를 포함한 실패 응답 생성 메서드
     * @param message 응답 메시지
     * @param data 응답 데이터
     * @return 실패 응답
     */
    public static ApiResponse error(String message, Object data) {
        return new ApiResponse(false, message, data);
    }
    
    // Getter 및 Setter
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public Object getData() {
        return data;
    }
    
    public void setData(Object data) {
        this.data = data;
    }
} 
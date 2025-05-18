package com.yhk.webchat.chat_backend.dto.request.chat;

import java.util.List;

/**
 * 채팅방 생성 요청 DTO
 */
public class CreateChatRoomRequest {
    
    private Long workspaceId;        // 워크스페이스 ID
    private String name;             // 채팅방 이름
    private String description;      // 채팅방 설명
    private List<Long> memberIds;    // 멤버 ID 목록
    private boolean isDirect;        // 1:1 채팅 여부
    
    // 기본 생성자
    public CreateChatRoomRequest() {
    }
    
    // 모든 필드를 매개변수로 받는 생성자
    public CreateChatRoomRequest(Long workspaceId, String name, String description, 
                                List<Long> memberIds, boolean isDirect) {
        this.workspaceId = workspaceId;
        this.name = name;
        this.description = description;
        this.memberIds = memberIds;
        this.isDirect = isDirect;
    }
    
    // Getter & Setter
    public Long getWorkspaceId() {
        return workspaceId;
    }
    
    public void setWorkspaceId(Long workspaceId) {
        this.workspaceId = workspaceId;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public List<Long> getMemberIds() {
        return memberIds;
    }
    
    public void setMemberIds(List<Long> memberIds) {
        this.memberIds = memberIds;
    }
    
    public boolean isDirect() {
        return isDirect;
    }
    
    public void setDirect(boolean isDirect) {
        this.isDirect = isDirect;
    }
} 
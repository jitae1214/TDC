package com.yhk.webchat.chat_backend.dto.request.workspace;

import jakarta.validation.constraints.Size;

/**
 * 워크스페이스 수정 요청 DTO
 */
public class UpdateWorkspaceRequest {
    
    @Size(min = 2, max = 100, message = "워크스페이스 이름은 2자 이상 100자 이하여야 합니다")
    private String name;
    
    @Size(max = 500, message = "설명은 500자 이하여야 합니다")
    private String description;
    
    @Size(max = 20, message = "아이콘 색상은 20자 이하여야 합니다")
    private String iconColor;
    
    // 기본 생성자
    public UpdateWorkspaceRequest() {}
    
    // 모든 필드 생성자
    public UpdateWorkspaceRequest(String name, String description, String iconColor) {
        this.name = name;
        this.description = description;
        this.iconColor = iconColor;
    }
    
    // Getter 및 Setter
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
    
    public String getIconColor() {
        return iconColor;
    }
    
    public void setIconColor(String iconColor) {
        this.iconColor = iconColor;
    }
    
    @Override
    public String toString() {
        return "UpdateWorkspaceRequest{" +
                "name='" + (name != null ? name : "null") + '\'' +
                ", description='" + (description != null ? description : "null") + '\'' +
                ", iconColor='" + (iconColor != null ? iconColor : "null") + '\'' +
                '}';
    }
} 
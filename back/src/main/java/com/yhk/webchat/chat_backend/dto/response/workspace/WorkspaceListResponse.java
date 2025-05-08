package com.yhk.webchat.chat_backend.dto.response.workspace;

import java.util.List;

/**
 * 워크스페이스 목록 응답 DTO
 */
public class WorkspaceListResponse {
    
    private List<WorkspaceResponse> workspaces;
    private int totalCount;
    private int ownedCount;
    private int joinedCount;
    
    // 기본 생성자
    public WorkspaceListResponse() {}
    
    // 생성자
    public WorkspaceListResponse(List<WorkspaceResponse> workspaces, int totalCount, int ownedCount, int joinedCount) {
        this.workspaces = workspaces;
        this.totalCount = totalCount;
        this.ownedCount = ownedCount;
        this.joinedCount = joinedCount;
    }
    
    // Getter 및 Setter
    public List<WorkspaceResponse> getWorkspaces() {
        return workspaces;
    }
    
    public void setWorkspaces(List<WorkspaceResponse> workspaces) {
        this.workspaces = workspaces;
    }
    
    public int getTotalCount() {
        return totalCount;
    }
    
    public void setTotalCount(int totalCount) {
        this.totalCount = totalCount;
    }
    
    public int getOwnedCount() {
        return ownedCount;
    }
    
    public void setOwnedCount(int ownedCount) {
        this.ownedCount = ownedCount;
    }
    
    public int getJoinedCount() {
        return joinedCount;
    }
    
    public void setJoinedCount(int joinedCount) {
        this.joinedCount = joinedCount;
    }
} 
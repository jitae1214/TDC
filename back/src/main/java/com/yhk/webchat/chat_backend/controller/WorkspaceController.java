package com.yhk.webchat.chat_backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.yhk.webchat.chat_backend.dto.request.workspace.AddMemberRequest;
import com.yhk.webchat.chat_backend.dto.request.workspace.CreateWorkspaceRequest;
import com.yhk.webchat.chat_backend.dto.request.workspace.UpdateMemberRoleRequest;
import com.yhk.webchat.chat_backend.dto.request.workspace.UpdateWorkspaceRequest;
import com.yhk.webchat.chat_backend.dto.response.workspace.WorkspaceListResponse;
import com.yhk.webchat.chat_backend.dto.response.workspace.WorkspaceMemberResponse;
import com.yhk.webchat.chat_backend.dto.response.workspace.WorkspaceResponse;
import com.yhk.webchat.chat_backend.model.User;
import com.yhk.webchat.chat_backend.repository.UserRepository;
import com.yhk.webchat.chat_backend.security.CurrentUser;
import com.yhk.webchat.chat_backend.service.WorkspaceService;

import jakarta.validation.Valid;

/**
 * 워크스페이스 관련 API 컨트롤러
 */
@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {
    
    @Autowired
    private WorkspaceService workspaceService;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * 현재 인증된 사용자 정보 조회
     * @param userDetails 현재 인증된 사용자 정보
     * @return 현재 사용자
     */
    private User getCurrentUser(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("사용자가 존재하지 않습니다."));
    }
    
    /**
     * 워크스페이스 생성
     * @param createRequest 생성 요청 정보
     * @param userDetails 현재 인증된 사용자 정보
     * @return 생성된 워크스페이스 정보
     */
    @PostMapping
    public ResponseEntity<WorkspaceResponse> createWorkspace(
            @Valid @RequestBody CreateWorkspaceRequest createRequest,
            @CurrentUser UserDetails userDetails) {
        
        try {
            User currentUser = getCurrentUser(userDetails);
            WorkspaceResponse workspace = workspaceService.createWorkspace(currentUser.getId(), createRequest);
            return ResponseEntity.ok(workspace);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 워크스페이스 목록 조회
     * @param type 조회 유형 (all, owned, joined)
     * @param userDetails 현재 인증된 사용자 정보
     * @return 워크스페이스 목록
     */
    @GetMapping
    public ResponseEntity<WorkspaceListResponse> getWorkspaces(
            @RequestParam(value = "type", defaultValue = "all") String type,
            @CurrentUser UserDetails userDetails) {
        
        try {
            User currentUser = getCurrentUser(userDetails);
            WorkspaceListResponse workspaces = workspaceService.getWorkspaces(currentUser.getId(), type);
            return ResponseEntity.ok(workspaces);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 워크스페이스 단일 조회
     * @param workspaceId 워크스페이스 ID
     * @param userDetails 현재 인증된 사용자 정보
     * @return 워크스페이스 정보
     */
    @GetMapping("/{id}")
    public ResponseEntity<WorkspaceResponse> getWorkspace(
            @PathVariable("id") Long workspaceId,
            @CurrentUser UserDetails userDetails) {
        
        try {
            User currentUser = getCurrentUser(userDetails);
            WorkspaceResponse workspace = workspaceService.getWorkspace(workspaceId, currentUser.getId());
            return ResponseEntity.ok(workspace);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).build(); // Forbidden
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 워크스페이스 수정
     * @param workspaceId 워크스페이스 ID
     * @param updateRequest 수정 요청 정보
     * @param userDetails 현재 인증된 사용자 정보
     * @return 수정된 워크스페이스 정보
     */
    @PutMapping("/{id}")
    public ResponseEntity<WorkspaceResponse> updateWorkspace(
            @PathVariable("id") Long workspaceId,
            @Valid @RequestBody UpdateWorkspaceRequest updateRequest,
            @CurrentUser UserDetails userDetails) {
        
        try {
            User currentUser = getCurrentUser(userDetails);
            WorkspaceResponse workspace = workspaceService.updateWorkspace(
                    workspaceId, currentUser.getId(), updateRequest);
            return ResponseEntity.ok(workspace);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).build(); // Forbidden
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 워크스페이스 삭제
     * @param workspaceId 워크스페이스 ID
     * @param userDetails 현재 인증된 사용자 정보
     * @return 삭제 결과
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkspace(
            @PathVariable("id") Long workspaceId,
            @CurrentUser UserDetails userDetails) {
        
        try {
            User currentUser = getCurrentUser(userDetails);
            boolean result = workspaceService.deleteWorkspace(workspaceId, currentUser.getId());
            
            if (result) {
                return ResponseEntity.noContent().build(); // 204 No Content
            } else {
                return ResponseEntity.internalServerError().build();
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).build(); // Forbidden
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 워크스페이스 멤버 목록 조회
     * @param workspaceId 워크스페이스 ID
     * @param userDetails 현재 인증된 사용자 정보
     * @return 멤버 목록
     */
    @GetMapping("/{id}/members")
    public ResponseEntity<List<WorkspaceMemberResponse>> getWorkspaceMembers(
            @PathVariable("id") Long workspaceId,
            @CurrentUser UserDetails userDetails) {
        
        try {
            User currentUser = getCurrentUser(userDetails);
            List<WorkspaceMemberResponse> members = workspaceService.getWorkspaceMembers(workspaceId, currentUser.getId());
            return ResponseEntity.ok(members);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).build(); // Forbidden
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 워크스페이스에 멤버 추가
     * @param workspaceId 워크스페이스 ID
     * @param addMemberRequest 멤버 추가 요청 정보
     * @param userDetails 현재 인증된 사용자 정보
     * @return 추가된 멤버 정보
     */
    @PostMapping("/{id}/members")
    public ResponseEntity<WorkspaceMemberResponse> addMember(
            @PathVariable("id") Long workspaceId,
            @Valid @RequestBody AddMemberRequest addMemberRequest,
            @CurrentUser UserDetails userDetails) {
        
        try {
            User currentUser = getCurrentUser(userDetails);
            WorkspaceMemberResponse member = workspaceService.addMember(
                    workspaceId, currentUser.getId(), addMemberRequest);
            return ResponseEntity.ok(member);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).build(); // Forbidden
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 워크스페이스 멤버 역할 수정
     * @param workspaceId 워크스페이스 ID
     * @param memberId 수정할 멤버 ID
     * @param updateRoleRequest 역할 수정 요청 정보
     * @param userDetails 현재 인증된 사용자 정보
     * @return 수정된 멤버 정보
     */
    @PutMapping("/{id}/members/{memberId}")
    public ResponseEntity<WorkspaceMemberResponse> updateMemberRole(
            @PathVariable("id") Long workspaceId,
            @PathVariable("memberId") Long memberId,
            @Valid @RequestBody UpdateMemberRoleRequest updateRoleRequest,
            @CurrentUser UserDetails userDetails) {
        
        try {
            User currentUser = getCurrentUser(userDetails);
            WorkspaceMemberResponse member = workspaceService.updateMemberRole(
                    workspaceId, currentUser.getId(), memberId, updateRoleRequest);
            return ResponseEntity.ok(member);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).build(); // Forbidden
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 워크스페이스에서 멤버 제거
     * @param workspaceId 워크스페이스 ID
     * @param memberId 제거할 멤버 ID
     * @param userDetails 현재 인증된 사용자 정보
     * @return 제거 결과
     */
    @DeleteMapping("/{id}/members/{memberId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable("id") Long workspaceId,
            @PathVariable("memberId") Long memberId,
            @CurrentUser UserDetails userDetails) {
        
        try {
            User currentUser = getCurrentUser(userDetails);
            boolean result = workspaceService.removeMember(workspaceId, currentUser.getId(), memberId);
            
            if (result) {
                return ResponseEntity.noContent().build(); // 204 No Content
            } else {
                return ResponseEntity.internalServerError().build();
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).build(); // Forbidden
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 본인이 워크스페이스 탈퇴
     * @param workspaceId 워크스페이스 ID
     * @param userDetails 현재 인증된 사용자 정보
     * @return 탈퇴 결과
     */
    @PostMapping("/{id}/leave")
    public ResponseEntity<Void> leaveWorkspace(
            @PathVariable("id") Long workspaceId,
            @CurrentUser UserDetails userDetails) {
        
        try {
            User currentUser = getCurrentUser(userDetails);
            boolean result = workspaceService.removeMember(workspaceId, currentUser.getId(), currentUser.getId());
            
            if (result) {
                return ResponseEntity.noContent().build(); // 204 No Content
            } else {
                return ResponseEntity.internalServerError().build();
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).build(); // Forbidden
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 워크스페이스 이름 중복 체크
     * @param name 워크스페이스 이름
     * @return 사용 가능 여부
     */
    @GetMapping("/check-name")
    public ResponseEntity<Boolean> checkWorkspaceName(@RequestParam("name") String name) {
        try {
            boolean isAvailable = workspaceService.isWorkspaceNameAvailable(name);
            return ResponseEntity.ok(isAvailable);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 최근 생성된 워크스페이스 목록 조회
     * @param limit 조회할 개수 (기본값: 5)
     * @return 최근 생성된 워크스페이스 목록
     */
    @GetMapping("/recent")
    public ResponseEntity<List<WorkspaceResponse>> getRecentWorkspaces(
            @RequestParam(value = "limit", defaultValue = "5") int limit) {
        
        try {
            List<WorkspaceResponse> workspaces = workspaceService.getRecentWorkspaces(limit);
            return ResponseEntity.ok(workspaces);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
} 
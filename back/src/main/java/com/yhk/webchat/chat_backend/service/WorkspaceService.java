package com.yhk.webchat.chat_backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yhk.webchat.chat_backend.dto.request.workspace.AddMemberRequest;
import com.yhk.webchat.chat_backend.dto.request.workspace.CreateWorkspaceRequest;
import com.yhk.webchat.chat_backend.dto.request.workspace.UpdateMemberRoleRequest;
import com.yhk.webchat.chat_backend.dto.request.workspace.UpdateWorkspaceRequest;
import com.yhk.webchat.chat_backend.dto.response.ApiResponse;
import com.yhk.webchat.chat_backend.dto.response.workspace.WorkspaceListResponse;
import com.yhk.webchat.chat_backend.dto.response.workspace.WorkspaceMemberResponse;
import com.yhk.webchat.chat_backend.dto.response.workspace.WorkspaceResponse;
import com.yhk.webchat.chat_backend.model.ChatRoom;
import com.yhk.webchat.chat_backend.model.ChatRoomMember;
import com.yhk.webchat.chat_backend.model.User;
import com.yhk.webchat.chat_backend.model.Workspace;
import com.yhk.webchat.chat_backend.model.WorkspaceMembership;
import com.yhk.webchat.chat_backend.repository.ChatRoomMemberRepository;
import com.yhk.webchat.chat_backend.repository.ChatRoomRepository;
import com.yhk.webchat.chat_backend.repository.UserRepository;
import com.yhk.webchat.chat_backend.repository.WorkspaceMembershipRepository;
import com.yhk.webchat.chat_backend.repository.WorkspaceRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

/**
 * 워크스페이스 관련 비즈니스 로직을 담당하는 서비스
 */
@Service
public class WorkspaceService {
    
    @Autowired
    private WorkspaceRepository workspaceRepository;
    
    @Autowired
    private WorkspaceMembershipRepository membershipRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ChatService chatService;
    
    @Autowired
    private ChatRoomRepository chatRoomRepository;
    
    @Autowired
    private ChatRoomMemberRepository chatRoomMemberRepository;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    /**
     * 워크스페이스 생성
     * @param userId 생성자 ID
     * @param createRequest 생성 요청 정보
     * @return 생성된 워크스페이스 정보
     */
    @Transactional
    public WorkspaceResponse createWorkspace(Long userId, CreateWorkspaceRequest createRequest) {
        // 1. 사용자 조회
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));
        
        // 2. 워크스페이스 이름 중복 검사 (동일 사용자가 만든 동일 이름의 워크스페이스만 체크)
        List<Workspace> userWorkspaces = workspaceRepository.findByOwner(owner);
        boolean hasDuplicateName = userWorkspaces.stream()
                .anyMatch(w -> w.getName().equals(createRequest.getName()));
                
        if (hasDuplicateName) {
            throw new IllegalArgumentException("이미 동일한 이름의 워크스페이스를 가지고 있습니다: " + createRequest.getName());
        }
        
        // 3. 워크스페이스 생성
        Workspace workspace = Workspace.builder()
                .name(createRequest.getName())
                .description(createRequest.getDescription())
                .owner(owner)
                .iconColor(createRequest.getIconColor())
                .imageUrl(createRequest.getImageUrl())
                .build();
        
        workspace = workspaceRepository.save(workspace);
        
        // 4. 워크스페이스 멤버십 생성 (소유자)
        WorkspaceMembership membership = WorkspaceMembership.builder()
                .workspace(workspace)
                .user(owner)
                .role("OWNER")
                .joinedAt(LocalDateTime.now())
                .build();
        
        membershipRepository.save(membership);
        
        // 5. 기본 채팅방 생성
        String chatRoomName = workspace.getName() + " 채널";
        String chatRoomDescription = workspace.getName() + "의 기본 채팅 채널입니다.";
        List<Long> memberIds = new ArrayList<>();
        memberIds.add(owner.getId());
        
        // 채팅방 생성 및 응답 데이터 가져오기
        ApiResponse chatRoomResponse = chatService.createChatRoom(
            workspace.getId(),
            chatRoomName,
            chatRoomDescription,
            owner.getId(),
            memberIds,
            false  // 일반 채팅방 (1:1 채팅방 아님)
        );
        
        // 채팅방 ID 가져오기
        if (chatRoomResponse.isSuccess() && chatRoomResponse.getData() != null) {
            try {
                // Data에서 chatRoomId 추출
                Long chatRoomId = null;
                
                if (chatRoomResponse.getData() instanceof Map) {
                    Map<String, Object> dataMap = (Map<String, Object>) chatRoomResponse.getData();
                    if (dataMap.containsKey("chatRoomId")) {
                        chatRoomId = ((Number) dataMap.get("chatRoomId")).longValue();
                    }
                }
                
                if (chatRoomId != null) {
                    // 채팅방 객체 조회
                    Optional<ChatRoom> chatRoomOpt = chatRoomRepository.findById(chatRoomId);
                    
                    if (chatRoomOpt.isPresent()) {
                        // 채팅방 객체 
                        ChatRoom chatRoom = chatRoomOpt.get();
                        
                        // 워크스페이스에 기본 채팅방 설정
                        workspace.setDefaultChatRoom(chatRoom);
                        workspaceRepository.save(workspace);
                        
                        // 워크스페이스 멤버십에 채팅방 연결
                        membership.setChatRoom(chatRoom);
                        membershipRepository.save(membership);
                        
                        // 채팅방 멤버에 워크스페이스 설정
                        Optional<ChatRoomMember> chatRoomMemberOpt = 
                                chatRoomMemberRepository.findByChatRoomIdAndUserId(chatRoomId, userId);
                        
                        if (chatRoomMemberOpt.isPresent()) {
                            ChatRoomMember chatRoomMember = chatRoomMemberOpt.get();
                            chatRoomMember.setWorkspace(workspace);
                            chatRoomMemberRepository.save(chatRoomMember);
                        }
                    }
                }
            } catch (Exception e) {
                // 에러 발생 시 로그만 남기고 계속 진행
                System.err.println("채팅방 연결 중 오류 발생: " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        // 6. 응답 생성
        return new WorkspaceResponse(workspace, 1, "OWNER");
    }
    
    /**
     * 워크스페이스 단일 조회
     * @param workspaceId 워크스페이스 ID
     * @param userId 조회 요청자 ID
     * @return 워크스페이스 정보
     */
    @Transactional(readOnly = true)
    public WorkspaceResponse getWorkspace(Long workspaceId, Long userId) {
        // 1. 워크스페이스 조회
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("워크스페이스를 찾을 수 없습니다: " + workspaceId));
        
        // 2. 사용자의 워크스페이스 접근 권한 확인
        Optional<WorkspaceMembership> membershipOpt = membershipRepository.findByWorkspaceIdAndUserId(workspaceId, userId);
        if (membershipOpt.isEmpty()) {
            throw new IllegalStateException("워크스페이스에 접근 권한이 없습니다: " + workspaceId);
        }
        
        // 3. 멤버 수 조회
        int memberCount = membershipRepository.countByWorkspaceId(workspaceId);
        
        // 4. 응답 생성
        return new WorkspaceResponse(workspace, memberCount, membershipOpt.get().getRole());
    }
    
    /**
     * 워크스페이스 목록 조회
     * @param userId 사용자 ID
     * @param listType 조회 유형 (all, owned, joined)
     * @return 워크스페이스 목록
     */
    @Transactional(readOnly = true)
    public WorkspaceListResponse getWorkspaces(Long userId, String listType) {
        // 1. 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));
        
        List<Workspace> workspaces;
        
        // 2. 조회 유형에 따라 워크스페이스 목록 조회
        if ("owned".equals(listType)) {
            workspaces = workspaceRepository.findByOwner(user);
        } else if ("joined".equals(listType)) {
            // 소유하지 않고 멤버로 참여 중인 워크스페이스 조회
            List<Long> workspaceIds = membershipRepository.findByUser(user).stream()
                    .map(m -> m.getWorkspace().getId())
                    .collect(Collectors.toList());
            
            workspaces = workspaceRepository.findAllById(workspaceIds).stream()
                    .filter(w -> !w.getOwner().getId().equals(userId))
                    .collect(Collectors.toList());
        } else {
            // 전체 접근 가능한 워크스페이스 조회
            workspaces = workspaceRepository.findAccessibleWorkspaces(userId);
        }
        
        // 3. 응답 DTO 변환
        List<WorkspaceResponse> workspaceResponses = new ArrayList<>();
        
        for (Workspace workspace : workspaces) {
            // 멤버십 조회
            Optional<WorkspaceMembership> membershipOpt = 
                    membershipRepository.findByWorkspaceAndUser(workspace, user);
            
            if (membershipOpt.isPresent()) {
                int memberCount = membershipRepository.countByWorkspaceId(workspace.getId());
                workspaceResponses.add(new WorkspaceResponse(workspace, memberCount, membershipOpt.get().getRole()));
            }
        }
        
        // 4. 소유한 워크스페이스와 참여 중인 워크스페이스 카운트
        int ownedCount = workspaceRepository.countByOwnerId(userId);
        int joinedCount = membershipRepository.findByUserId(userId).size() - ownedCount;
        
        // 5. 응답 생성
        return new WorkspaceListResponse(
                workspaceResponses,
                workspaceResponses.size(),
                ownedCount,
                joinedCount
        );
    }
    
    /**
     * 워크스페이스 수정
     * @param workspaceId 워크스페이스 ID
     * @param userId 요청자 ID
     * @param updateRequest 수정 요청 정보
     * @return 수정된 워크스페이스 정보
     */
    @Transactional
    public WorkspaceResponse updateWorkspace(Long workspaceId, Long userId, UpdateWorkspaceRequest updateRequest) {
        // 1. 워크스페이스 조회
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("워크스페이스를 찾을 수 없습니다: " + workspaceId));
        
        // 2. 사용자 권한 확인 (소유자 또는 관리자만 수정 가능)
        Optional<WorkspaceMembership> membershipOpt = membershipRepository.findByWorkspaceIdAndUserId(workspaceId, userId);
        if (membershipOpt.isEmpty() || (!membershipOpt.get().isAdmin() && !membershipOpt.get().isOwner())) {
            throw new IllegalStateException("워크스페이스를 수정할 권한이 없습니다");
        }
        
        // 3. 워크스페이스 정보 업데이트
        boolean updated = false;
        
        if (updateRequest.getName() != null && !updateRequest.getName().isEmpty()) {
            // 이름 중복 검사 (같은 소유자의 다른 워크스페이스와 중복되면 안 됨)
            if (!updateRequest.getName().equals(workspace.getName())) {
                User owner = workspace.getOwner();
                List<Workspace> ownerWorkspaces = workspaceRepository.findByOwner(owner);
                boolean hasDuplicateName = ownerWorkspaces.stream()
                        .filter(w -> !w.getId().equals(workspaceId)) // 현재 워크스페이스 제외
                        .anyMatch(w -> w.getName().equals(updateRequest.getName()));
                
                if (hasDuplicateName) {
                    throw new IllegalArgumentException("이미 동일한 이름의 워크스페이스를 가지고 있습니다: " + updateRequest.getName());
                }
            }
            workspace.setName(updateRequest.getName());
            updated = true;
        }
        
        if (updateRequest.getDescription() != null) {
            workspace.setDescription(updateRequest.getDescription());
            updated = true;
        }
        
        if (updateRequest.getIconColor() != null) {
            workspace.setIconColor(updateRequest.getIconColor());
            updated = true;
        }
        
        if (updateRequest.getImageUrl() != null) {
            workspace.setImageUrl(updateRequest.getImageUrl());
            updated = true;
        }
        
        if (updated) {
            workspace.setUpdatedAt(LocalDateTime.now());
            workspace = workspaceRepository.save(workspace);
        }
        
        // 4. 멤버 수 조회
        int memberCount = membershipRepository.countByWorkspaceId(workspaceId);
        
        // 5. 응답 생성
        return new WorkspaceResponse(workspace, memberCount, membershipOpt.get().getRole());
    }
    
    /**
     * 워크스페이스 삭제
     * @param workspaceId 워크스페이스 ID
     * @param userId 요청자 ID
     * @return 삭제 성공 여부
     */
    @Transactional
    public boolean deleteWorkspace(Long workspaceId, Long userId) {
        // 1. 워크스페이스 조회
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("워크스페이스를 찾을 수 없습니다: " + workspaceId));
        
        // 2. 사용자가 워크스페이스 소유자인지 확인
        if (!workspace.getOwner().getId().equals(userId)) {
            throw new IllegalStateException("워크스페이스를 삭제할 권한이 없습니다");
        }
        
        // 3. 워크스페이스 멤버십 모두 삭제
        List<WorkspaceMembership> memberships = membershipRepository.findByWorkspaceId(workspaceId);
        membershipRepository.deleteAll(memberships);
        
        // 4. 워크스페이스 삭제
        workspaceRepository.delete(workspace);
        
        return true;
    }
    
    /**
     * 워크스페이스에 멤버 추가
     * @param workspaceId 워크스페이스 ID
     * @param requesterId 요청자 ID
     * @param addMemberRequest 멤버 추가 요청 정보
     * @return 추가된 멤버 정보
     */
    @Transactional
    public WorkspaceMemberResponse addMember(Long workspaceId, Long requesterId, AddMemberRequest addMemberRequest) {
        // 1. 워크스페이스 조회
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("워크스페이스를 찾을 수 없습니다: " + workspaceId));
        
        // 2. 요청자의 권한 확인 (소유자 또는 관리자만 추가 가능)
        Optional<WorkspaceMembership> requesterMembershipOpt = membershipRepository.findByWorkspaceIdAndUserId(workspaceId, requesterId);
        if (requesterMembershipOpt.isEmpty() || !requesterMembershipOpt.get().isAdmin()) {
            throw new IllegalStateException("멤버를 추가할 권한이 없습니다");
        }
        
        // 3. 추가할 사용자 조회 (이메일 또는 사용자명으로)
        User userToAdd = null;
        String identifier = addMemberRequest.getUserIdentifier();
        
        // 이메일 형식인지 확인
        if (identifier.contains("@")) {
            userToAdd = userRepository.findByEmail(identifier)
                    .orElseThrow(() -> new IllegalArgumentException("해당 이메일로 사용자를 찾을 수 없습니다: " + identifier));
        } else {
            userToAdd = userRepository.findByUsername(identifier)
                    .orElseThrow(() -> new IllegalArgumentException("해당 아이디로 사용자를 찾을 수 없습니다: " + identifier));
        }
        
        // 4. 이미 멤버인지 확인
        if (membershipRepository.existsByWorkspaceIdAndUserId(workspaceId, userToAdd.getId())) {
            throw new IllegalStateException("이미 워크스페이스의 멤버입니다: " + identifier);
        }
        
        // 5. 멤버십 생성
        WorkspaceMembership membership = WorkspaceMembership.builder()
                .workspace(workspace)
                .user(userToAdd)
                .role(addMemberRequest.getRole())
                .joinedAt(LocalDateTime.now())
                .build();
        
        membership = membershipRepository.save(membership);
        
        // 6. 워크스페이스의 모든 채팅방에 멤버 추가
        chatService.addUserToWorkspaceChannels(workspaceId, userToAdd.getId());
        
        // 7. 응답 생성
        return new WorkspaceMemberResponse(membership);
    }
    
    /**
     * 워크스페이스 멤버 목록 조회
     * @param workspaceId 워크스페이스 ID
     * @param userId 요청자 ID
     * @return 멤버 목록
     */
    @Transactional(readOnly = true)
    public List<WorkspaceMemberResponse> getWorkspaceMembers(Long workspaceId, Long userId) {
        // 1. 워크스페이스 조회
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("워크스페이스를 찾을 수 없습니다: " + workspaceId));
        
        // 2. 사용자의 워크스페이스 접근 권한 확인
        if (!membershipRepository.existsByWorkspaceIdAndUserId(workspaceId, userId)) {
            throw new IllegalStateException("워크스페이스에 접근 권한이 없습니다: " + workspaceId);
        }
        
        // 3. 멤버십 목록 조회 및 응답 DTO 변환
        List<WorkspaceMembership> memberships = membershipRepository.findByWorkspaceId(workspaceId);
        
        return memberships.stream()
                .map(WorkspaceMemberResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * 워크스페이스 멤버 역할 수정
     * @param workspaceId 워크스페이스 ID
     * @param requesterId 요청자 ID
     * @param memberId 수정할 멤버 ID
     * @param updateRoleRequest 역할 수정 요청 정보
     * @return 수정된 멤버 정보
     */
    @Transactional
    public WorkspaceMemberResponse updateMemberRole(Long workspaceId, Long requesterId, Long memberId, 
            UpdateMemberRoleRequest updateRoleRequest) {
        // 1. 워크스페이스 조회
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("워크스페이스를 찾을 수 없습니다: " + workspaceId));
        
        // 2. 요청자의 권한 확인 (소유자 또는 관리자만 역할 변경 가능)
        Optional<WorkspaceMembership> requesterMembershipOpt = membershipRepository.findByWorkspaceIdAndUserId(workspaceId, requesterId);
        if (requesterMembershipOpt.isEmpty() || !requesterMembershipOpt.get().isAdmin()) {
            throw new IllegalStateException("역할을 변경할 권한이 없습니다");
        }
        
        // 3. 수정할 멤버십 조회
        Optional<WorkspaceMembership> membershipOpt = membershipRepository.findByWorkspaceIdAndUserId(workspaceId, memberId);
        if (membershipOpt.isEmpty()) {
            throw new IllegalArgumentException("해당 멤버를 찾을 수 없습니다: " + memberId);
        }
        
        WorkspaceMembership membership = membershipOpt.get();
        
        // 4. 소유자 역할은 변경 불가
        if (membership.isOwner()) {
            throw new IllegalStateException("워크스페이스 소유자의 역할은 변경할 수 없습니다");
        }
        
        // 5. OWNER 역할로 변경하는 경우, 기존 소유자 역할 변경 필요
        if ("OWNER".equals(updateRoleRequest.getRole())) {
            // 기존 소유자 찾기
            User owner = workspace.getOwner();
            Optional<WorkspaceMembership> ownerMembershipOpt = membershipRepository.findByWorkspaceAndUser(workspace, owner);
            
            if (ownerMembershipOpt.isPresent()) {
                WorkspaceMembership ownerMembership = ownerMembershipOpt.get();
                ownerMembership.setRole("ADMIN");
                membershipRepository.save(ownerMembership);
            }
            
            // 워크스페이스 소유자 변경
            User newOwner = membership.getUser();
            workspace.setOwner(newOwner);
            workspaceRepository.save(workspace);
        }
        
        // 6. 역할 업데이트
        membership.setRole(updateRoleRequest.getRole());
        membership = membershipRepository.save(membership);
        
        // 7. 응답 생성
        return new WorkspaceMemberResponse(membership);
    }
    
    /**
     * 워크스페이스에서 멤버 제거
     * @param workspaceId 워크스페이스 ID
     * @param requesterId 요청자 ID
     * @param memberId 제거할 멤버 ID
     * @return 제거 성공 여부
     */
    @Transactional
    public boolean removeMember(Long workspaceId, Long requesterId, Long memberId) {
        // 1. 워크스페이스 조회
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("워크스페이스를 찾을 수 없습니다: " + workspaceId));
        
        // 2. 본인이거나 권한 있는 사용자인지 확인
        boolean isSelfRemoval = requesterId.equals(memberId);
        
        if (!isSelfRemoval) {
            // 소유자 또는 관리자만 다른 멤버 제거 가능
            Optional<WorkspaceMembership> requesterMembershipOpt = membershipRepository.findByWorkspaceIdAndUserId(workspaceId, requesterId);
            if (requesterMembershipOpt.isEmpty() || !requesterMembershipOpt.get().isAdmin()) {
                throw new IllegalStateException("멤버를 제거할 권한이 없습니다");
            }
        }
        
        // 3. 제거할 멤버십 조회
        Optional<WorkspaceMembership> membershipOpt = membershipRepository.findByWorkspaceIdAndUserId(workspaceId, memberId);
        if (membershipOpt.isEmpty()) {
            throw new IllegalArgumentException("해당 멤버를 찾을 수 없습니다: " + memberId);
        }
        
        WorkspaceMembership membership = membershipOpt.get();
        
        // 4. 소유자는 제거할 수 없음
        if (membership.isOwner() && !isSelfRemoval) {
            throw new IllegalStateException("워크스페이스 소유자는 제거할 수 없습니다");
        }
        
        // 5. 소유자가 나가는 경우, 다른 관리자에게 소유권 이전 필요
        if (membership.isOwner() && isSelfRemoval) {
            // 다른 관리자 찾기
            List<WorkspaceMembership> adminMemberships = membershipRepository.findByWorkspaceAndRole(workspace, "ADMIN");
            
            if (adminMemberships.isEmpty()) {
                throw new IllegalStateException("다른 관리자가 없어 소유자는 나갈 수 없습니다. 먼저 다른 멤버를 관리자로 지정하세요.");
            }
            
            // 첫 번째 관리자에게 소유권 이전
            WorkspaceMembership newOwnerMembership = adminMemberships.get(0);
            newOwnerMembership.setRole("OWNER");
            membershipRepository.save(newOwnerMembership);
            
            // 워크스페이스 소유자 업데이트
            workspace.setOwner(newOwnerMembership.getUser());
            workspaceRepository.save(workspace);
        }
        
        // 6. 멤버십 삭제
        membershipRepository.delete(membership);
        
        return true;
    }
    
    /**
     * 워크스페이스 이름 중복 체크
     * @param name 워크스페이스 이름
     * @param userId 사용자 ID (선택적)
     * @return 중복 여부
     */
    @Transactional(readOnly = true)
    public boolean isWorkspaceNameAvailable(String name, Long userId) {
        if (userId == null) {
            // 단순히 이름만 체크 (기존 호환성 유지)
            return !workspaceRepository.existsByName(name);
        } else {
            // 특정 사용자의 워크스페이스 이름 중복 체크
            User owner = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));
            
            List<Workspace> userWorkspaces = workspaceRepository.findByOwner(owner);
            return userWorkspaces.stream()
                    .noneMatch(w -> w.getName().equals(name));
        }
    }
    
    /**
     * 워크스페이스 이름 중복 체크 (기존 호환성 유지)
     * @param name 워크스페이스 이름
     * @return 중복 여부
     */
    @Transactional(readOnly = true)
    public boolean isWorkspaceNameAvailable(String name) {
        return isWorkspaceNameAvailable(name, null);
    }

    /**
     * 최근 생성된 워크스페이스 목록 조회
     * @param limit 조회할 개수
     * @return 최근 생성된 워크스페이스 목록
     */
    @Transactional(readOnly = true)
    public List<WorkspaceResponse> getRecentWorkspaces(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<Workspace> workspaces = workspaceRepository.findRecentWorkspaces(pageable);
        
        List<WorkspaceResponse> responses = new ArrayList<>();
        for (Workspace workspace : workspaces) {
            int memberCount = membershipRepository.countByWorkspaceId(workspace.getId());
            // 요청자가 없으므로 멤버십 정보는 null로 설정
            responses.add(new WorkspaceResponse(workspace, memberCount, null));
        }
        
        return responses;
    }
} 
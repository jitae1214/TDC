package com.yhk.webchat.chat_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.yhk.webchat.chat_backend.model.User;
import com.yhk.webchat.chat_backend.model.Workspace;
import com.yhk.webchat.chat_backend.model.WorkspaceMembership;

import java.util.List;
import java.util.Optional;

/**
 * 워크스페이스 멤버십 정보 저장소
 * 워크스페이스 멤버십 데이터 접근을 위한 Repository 인터페이스
 */
@Repository
public interface WorkspaceMembershipRepository extends JpaRepository<WorkspaceMembership, Long> {
    
    /**
     * 워크스페이스와 사용자로 멤버십 조회
     * @param workspace 워크스페이스
     * @param user 사용자
     * @return 멤버십 정보
     */
    Optional<WorkspaceMembership> findByWorkspaceAndUser(Workspace workspace, User user);
    
    /**
     * 워크스페이스 ID와 사용자 ID로 멤버십 조회
     * @param workspaceId 워크스페이스 ID
     * @param userId 사용자 ID
     * @return 멤버십 정보
     */
    @Query("SELECT m FROM WorkspaceMembership m WHERE m.workspace.id = :workspaceId AND m.user.id = :userId")
    Optional<WorkspaceMembership> findByWorkspaceIdAndUserId(@Param("workspaceId") Long workspaceId, @Param("userId") Long userId);
    
    /**
     * 특정 워크스페이스의 모든 멤버 조회
     * @param workspace 워크스페이스
     * @return 멤버십 목록
     */
    List<WorkspaceMembership> findByWorkspace(Workspace workspace);
    
    /**
     * 특정 워크스페이스의 모든 멤버 조회 (ID 기준)
     * @param workspaceId 워크스페이스 ID
     * @return 멤버십 목록
     */
    List<WorkspaceMembership> findByWorkspaceId(Long workspaceId);
    
    /**
     * 특정 사용자의 모든 워크스페이스 멤버십 조회
     * @param user 사용자
     * @return 멤버십 목록
     */
    List<WorkspaceMembership> findByUser(User user);
    
    /**
     * 특정 사용자의 모든 워크스페이스 멤버십 조회 (ID 기준)
     * @param userId 사용자 ID
     * @return 멤버십 목록
     */
    List<WorkspaceMembership> findByUserId(Long userId);
    
    /**
     * 특정 워크스페이스의 특정 역할을 가진 멤버 조회
     * @param workspace 워크스페이스
     * @param role 역할 (OWNER, ADMIN, MEMBER)
     * @return 멤버십 목록
     */
    List<WorkspaceMembership> findByWorkspaceAndRole(Workspace workspace, String role);
    
    /**
     * 워크스페이스 멤버 역할 업데이트
     * @param workspaceId 워크스페이스 ID
     * @param userId 사용자 ID
     * @param role 변경할 역할
     */
    @Modifying
    @Transactional
    @Query("UPDATE WorkspaceMembership m SET m.role = :role WHERE m.workspace.id = :workspaceId AND m.user.id = :userId")
    void updateRole(@Param("workspaceId") Long workspaceId, @Param("userId") Long userId, @Param("role") String role);
    
    /**
     * 멤버십 존재 여부 확인
     * @param workspaceId 워크스페이스 ID
     * @param userId 사용자 ID
     * @return 존재 여부
     */
    boolean existsByWorkspaceIdAndUserId(Long workspaceId, Long userId);
    
    /**
     * 특정 워크스페이스의 멤버 수 카운트
     * @param workspaceId 워크스페이스 ID
     * @return 멤버 수
     */
    @Query("SELECT COUNT(m) FROM WorkspaceMembership m WHERE m.workspace.id = :workspaceId")
    int countByWorkspaceId(@Param("workspaceId") Long workspaceId);
    
    /**
     * 워크스페이스 멤버십 삭제
     * @param workspaceId 워크스페이스 ID
     * @param userId 사용자 ID
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM WorkspaceMembership m WHERE m.workspace.id = :workspaceId AND m.user.id = :userId")
    void deleteByWorkspaceIdAndUserId(@Param("workspaceId") Long workspaceId, @Param("userId") Long userId);
} 
package com.yhk.webchat.chat_backend.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.yhk.webchat.chat_backend.model.User;
import com.yhk.webchat.chat_backend.model.Workspace;

import java.util.List;
import java.util.Optional;

/**
 * 워크스페이스 정보 저장소
 * 워크스페이스 데이터 접근을 위한 Repository 인터페이스
 */
@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
    
    /**
     * 워크스페이스 이름으로 조회
     * @param name 워크스페이스 이름
     * @return 워크스페이스 정보
     */
    Optional<Workspace> findByName(String name);
    
    /**
     * 특정 소유자의 워크스페이스 목록 조회
     * @param owner 소유자
     * @return 워크스페이스 목록
     */
    List<Workspace> findByOwner(User owner);
    
    /**
     * 워크스페이스 이름이 이미 존재하는지 확인
     * @param name 워크스페이스 이름
     * @return 존재 여부
     */
    boolean existsByName(String name);
    
    /**
     * 워크스페이스 이름으로 검색 (부분 일치)
     * @param name 검색할 이름
     * @return 일치하는 워크스페이스 목록
     */
    @Query("SELECT w FROM Workspace w WHERE w.name LIKE %:name%")
    List<Workspace> searchByName(@Param("name") String name);
    
    /**
     * 특정 사용자가 소유한 워크스페이스 카운트
     * @param ownerId 소유자 ID
     * @return 워크스페이스 개수
     */
    @Query("SELECT COUNT(w) FROM Workspace w WHERE w.owner.id = :ownerId")
    int countByOwnerId(@Param("ownerId") Long ownerId);
    
    /**
     * 생성 날짜를 기준으로 최근 워크스페이스 조회
     * @param limit 조회할 개수
     * @return 최근 생성된 워크스페이스 목록
     */
    @Query("SELECT w FROM Workspace w ORDER BY w.createdAt DESC")
    List<Workspace> findRecentWorkspaces(Pageable pageable);
    
    /**
     * 사용자가 접근 가능한 워크스페이스 목록 조회 (멤버십 포함)
     * @param userId 사용자 ID
     * @return 접근 가능한 워크스페이스 목록
     */
    @Query("SELECT DISTINCT w FROM Workspace w JOIN WorkspaceMembership m ON w.id = m.workspace.id WHERE m.user.id = :userId")
    List<Workspace> findAccessibleWorkspaces(@Param("userId") Long userId);
} 
package com.yhk.webchat.chat_backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.yhk.webchat.chat_backend.model.User;
import com.yhk.webchat.chat_backend.model.VerificationToken;

/**
 * 이메일 인증 토큰 저장소
 * 인증 토큰 데이터 접근을 위한 Repository 인터페이스
 */
@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    
    /**
     * 토큰으로 인증 정보 찾기
     * @param token 인증 토큰
     * @return 인증 토큰 정보
     */
    Optional<VerificationToken> findByToken(String token);
    
    /**
     * 사용자로 인증 정보 찾기
     * @param user 사용자
     * @return 인증 토큰 정보
     */
    Optional<VerificationToken> findByUser(User user);
    
    /**
     * 사용자 관련 인증 토큰 모두 삭제
     * @param user 사용자
     */
    void deleteByUser(User user);
    
    /**
     * 만료된 토큰 삭제
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM VerificationToken v WHERE v.expiryDate < CURRENT_TIMESTAMP")
    void deleteExpiredTokens();
    
    /**
     * 토큰 만료 여부 확인
     * @param token 확인할 토큰
     * @return 만료 여부
     */
    @Query("SELECT CASE WHEN v.expiryDate < CURRENT_TIMESTAMP THEN true ELSE false END FROM VerificationToken v WHERE v.token = :token")
    boolean isTokenExpired(@Param("token") String token);
} 
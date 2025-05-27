package com.yhk.webchat.chat_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.yhk.webchat.chat_backend.model.User;

import java.util.List;
import java.util.Optional;

/**
 * 사용자 정보 저장소
 * 사용자 데이터 접근을 위한 Repository 인터페이스
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
      아이디로 사용자 찾기

      @param username 사용자 아이디
      @return 사용자 정보

     **/
    Optional<User> findByUsername(String username); 
    
    /**
      이메일로 사용자 찾기

      @param email 이메일
      @return 사용자 정보

     **/
    Optional<User> findByEmail(String email);
    
    /**
      사용자 상태로 사용자 목록 찾기

      @param status 사용자 상태 (ONLINE, OFFLINE, AWAY)
      @return 해당 상태의 사용자 목록

     **/
    List<User> findByStatus(String status);
    
    /**
      아이디 또는 이메일로 사용자 찾기

      @param username 사용자 아이디
      @param email 이메일
      @return 사용자 정보

     **/
    Optional<User> findByUsernameOrEmail(String username, String email);
    
    /**
      아이디 중복 확인

      @param username 사용자 아이디
      @return 존재 여부

     **/
    boolean existsByUsername(String username);
    
    /**
      이메일 중복 확인
      @param email 이메일
      @return 존재 여부
     **/
    boolean existsByEmail(String email);
    
    /**
      소셜 ID와 제공자로 사용자 찾기

      @param socialId 소셜 ID
      @param provider 제공자 (kakao, naver, google)
      @return 사용자 정보

     **/
    Optional<User> findBySocialIdAndProvider(String socialId, String provider);
    
    /**
      소셜 ID와 제공자로 사용자 존재 여부 확인

      @param socialId 소셜 ID
      @param provider 제공자
      @return 존재 여부

     **/
    boolean existsBySocialIdAndProvider(String socialId, String provider);
    
    /**
      소셜 계정 연동 업데이트

      @param userId 사용자 ID
      @param socialId 소셜 ID
      @param provider 제공자

     **/
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.socialId = :socialId, u.provider = :provider WHERE u.id = :userId")
    void updateSocialInfo(@Param("userId") Long userId, @Param("socialId") String socialId, @Param("provider") String provider);
    
    /**
      사용자 상태 업데이트

      @param userId 사용자 ID
      @param status 변경할 상태

     **/
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.status = :status WHERE u.id = :userId")
    void updateStatus(@Param("userId") Long userId, @Param("status") String status);
    
    /**
      닉네임으로 사용자 검색 (부분 일치)

      @param nickname 검색할 닉네임
      @return 일치하는 사용자 목록

     **/
    @Query("SELECT u FROM User u WHERE u.nickname LIKE %:nickname%")
    List<User> searchByNickname(@Param("nickname") String nickname);
    
    /**
      이메일 인증 상태 업데이트

      @param userId 사용자 ID
      @param verified 인증 여부

     **/
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.emailVerified = :verified WHERE u.id = :userId")
    void updateEmailVerified(@Param("userId") Long userId, @Param("verified") boolean verified);
} 
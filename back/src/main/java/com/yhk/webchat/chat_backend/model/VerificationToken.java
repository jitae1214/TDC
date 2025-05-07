package com.yhk.webchat.chat_backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;

/**
 * 이메일 인증 토큰 엔티티
 */
@Entity /* Entity : 데이터베이스 테이블로 맵핑  */
@Table(name = "verification_tokens")
public class VerificationToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String token;
    
    @Column(name = "verification_code", length = 6)
    private String verificationCode;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    // 기본 생성자
    public VerificationToken() {
    }
    
    // 모든 필드 포함 생성자
    public VerificationToken(Long id, String token, String verificationCode, User user, LocalDateTime expiryDate, LocalDateTime createdAt) {
        this.id = id;
        this.token = token;
        this.verificationCode = verificationCode;
        this.user = user;
        this.expiryDate = expiryDate;
        if (createdAt != null) {
            this.createdAt = createdAt;
        }
    }
    
    // 토큰과 사용자 정보를 포함한 생성자
    public VerificationToken(String token, String verificationCode, User user, LocalDateTime expiryDate) {
        this.token = token;
        this.verificationCode = verificationCode;
        this.user = user;
        this.expiryDate = expiryDate;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getter 및 Setter 메서드
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
    
    public String getVerificationCode() {
        return verificationCode;
    }
    
    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    // 토큰 만료 여부 확인
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiryDate);
    }
    
    // 빌더 패턴 구현을 위한 정적 내부 클래스
    public static VerificationTokenBuilder builder() {
        return new VerificationTokenBuilder();
    }
    
    // 빌더 패턴 구현을 위한 정적 내부 클래스
    public static class VerificationTokenBuilder {
        private Long id;
        private String token;
        private String verificationCode;
        private User user;
        private LocalDateTime expiryDate;
        private LocalDateTime createdAt = LocalDateTime.now();
        
        public VerificationTokenBuilder id(Long id) {
            this.id = id;
            return this;
        }
        
        public VerificationTokenBuilder token(String token) {
            this.token = token;
            return this;
        }
        
        public VerificationTokenBuilder verificationCode(String verificationCode) {
            this.verificationCode = verificationCode;
            return this;
        }
        
        public VerificationTokenBuilder user(User user) {
            this.user = user;
            return this;
        }
        
        public VerificationTokenBuilder expiryDate(LocalDateTime expiryDate) {
            this.expiryDate = expiryDate;
            return this;
        }
        
        public VerificationTokenBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }
        
        public VerificationToken build() {
            VerificationToken token = new VerificationToken();
            token.id = this.id;
            token.token = this.token;
            token.verificationCode = this.verificationCode;
            token.user = this.user;
            token.expiryDate = this.expiryDate;
            token.createdAt = this.createdAt;
            return token;
        }
    }
} 
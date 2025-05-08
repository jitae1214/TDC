package com.yhk.webchat.chat_backend.service;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Optional;
import java.util.Random;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yhk.webchat.chat_backend.dto.request.auth.EmailVerificationRequest;
import com.yhk.webchat.chat_backend.dto.request.auth.RegisterRequest;
import com.yhk.webchat.chat_backend.dto.request.auth.PasswordResetRequest;
import com.yhk.webchat.chat_backend.dto.response.auth.EmailAvailabilityResponse;
import com.yhk.webchat.chat_backend.dto.response.auth.EmailVerificationResponse;
import com.yhk.webchat.chat_backend.dto.response.auth.RegisterResponse;
import com.yhk.webchat.chat_backend.dto.response.auth.UsernameAvailabilityResponse;
import com.yhk.webchat.chat_backend.dto.response.ApiResponse;
import com.yhk.webchat.chat_backend.model.User;
import com.yhk.webchat.chat_backend.model.VerificationToken;
import com.yhk.webchat.chat_backend.repository.UserRepository;
import com.yhk.webchat.chat_backend.repository.VerificationTokenRepository;

/**
 * 회원가입 관련 서비스
 */
@Service
public class RegisterService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private VerificationTokenRepository tokenRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private EmailService emailService;
    
    @Value("${app.verification.host}")
    private String verificationHost;
    
    private final Random random = new Random();
    
    /**
     * 6자리 인증 코드 생성
     * @return 생성된 인증 코드
     */
    private String generateVerificationCode() {
        int code = 100000 + random.nextInt(900000); // 100000-999999 사이의 난수
        return String.valueOf(code);
    }
    
    /**
     * 회원가입 처리
     * @param registerRequest 회원가입 요청 정보
     * @return 회원가입 결과
     */
    @Transactional
    public ApiResponse register(RegisterRequest registerRequest) {
        try {
            // 아이디, 이메일 중복 검사
            if (userRepository.existsByUsername(registerRequest.getUsername())) {
                return new ApiResponse(false, "이미 사용 중인 아이디입니다.", null);
            }
            
            if (userRepository.existsByEmail(registerRequest.getEmail())) {
                return new ApiResponse(false, "이미 사용 중인 이메일입니다.", null);
            }
            
            // 사용자 생성
            User user = User.builder()
                    .username(registerRequest.getUsername())
                    .password(passwordEncoder.encode(registerRequest.getPassword()))
                    .email(registerRequest.getEmail())
                    .fullName(registerRequest.getFullName())
                    .nickname(registerRequest.getNickname())
                    .profileImageUrl(registerRequest.getProfileImage()) // 프로필 이미지 URL 설정
                    .status("OFFLINE")
                    .emailVerified(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            
            user = userRepository.save(user);
            
            // 이메일 인증 토큰과 인증 코드 생성 및 저장
            String token = UUID.randomUUID().toString();
            String verificationCode = generateVerificationCode();
            
            VerificationToken verificationToken = new VerificationToken(
                    token, 
                    verificationCode,
                    user, 
                    LocalDateTime.now().plusHours(24) // 24시간 유효
            );
            
            tokenRepository.save(verificationToken);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("userId", user.getId());
            responseData.put("username", user.getUsername());
            responseData.put("email", user.getEmail());
            
            return new ApiResponse(true, "회원가입이 완료되었습니다. 이메일 인증을 진행해주세요.", responseData);
            
        } catch (Exception e) {
            e.printStackTrace();
            return new ApiResponse(false, "회원가입 처리 중 오류가 발생했습니다: " + e.getMessage(), null);
        }
    }
    
    /**
     * 인증 코드 발송
     * @param email 이메일
     * @return 발송 결과
     */
    @Transactional
    public ApiResponse sendVerificationCode(String email) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            
            if (userOpt.isEmpty()) {
                return new ApiResponse(false, "등록되지 않은 이메일입니다.", null);
            }
            
            User user = userOpt.get();
            
            if (user.isEmailVerified()) {
                return new ApiResponse(false, "이미 인증된 이메일입니다.", null);
            }
            
            // 기존 토큰 삭제
            tokenRepository.deleteByUser(user);
            
            // 새 토큰과 인증 코드 생성
            String token = UUID.randomUUID().toString();
            String verificationCode = generateVerificationCode();
            
            VerificationToken verificationToken = new VerificationToken(
                    token, 
                    verificationCode,
                    user, 
                    LocalDateTime.now().plusHours(24) // 24시간 유효
            );
            
            tokenRepository.save(verificationToken);
            
            // 인증 이메일 발송
            emailService.sendVerificationEmail(
                user.getEmail(),
                "[채팅 웹] 이메일 인증 안내",
                verificationCode,
                user.getUsername(),
                user.getFullName()
            );
            
            return new ApiResponse(true, "인증 코드가 이메일로 발송되었습니다.", null);
        } catch (Exception e) {
            return new ApiResponse(false, "인증 코드 발송 중 오류가 발생했습니다: " + e.getMessage(), null);
        }
    }
    
    /**
     * 인증 코드 확인
     * @param email 이메일
     * @param code 인증 코드
     * @return 확인 결과
     */
    @Transactional
    public ApiResponse verifyCode(String email, String code) {
        if (email == null || email.isEmpty() || code == null || code.isEmpty()) {
            return new ApiResponse(false, "이메일과 인증 코드를 모두 입력해주세요.", null);
        }
        
        // 사용자 확인
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return new ApiResponse(false, "등록되지 않은 이메일입니다.", null);
        }
        
        User user = userOpt.get();
        
        // 이미 인증된 계정인지 확인
        if (user.isEmailVerified()) {
            return new ApiResponse(false, "이미 인증된 이메일입니다.", null);
        }
        
        // 인증 코드로 토큰 찾기
        Optional<VerificationToken> tokenOpt = tokenRepository.findByUserAndVerificationCode(user, code);
        
        if (tokenOpt.isEmpty()) {
            return new ApiResponse(false, "유효하지 않은 인증 코드입니다.", null);
        }
        
        VerificationToken verificationToken = tokenOpt.get();
        
        // 인증 코드 만료 확인
        if (verificationToken.isExpired()) {
            return new ApiResponse(false, "만료된 인증 코드입니다. 인증 코드를 재발송해주세요.", null);
        }
        
        // 이메일 인증 완료 처리
        user.setEmailVerified(true);
        userRepository.save(user);
        
        // 사용된 토큰 삭제
        tokenRepository.delete(verificationToken);
        
        return new ApiResponse(true, "이메일 인증이 완료되었습니다.", null);
    }
    
    /**
     * 비밀번호 재설정
     * @param resetRequest 비밀번호 재설정 요청 정보
     * @return 재설정 결과
     */
    @Transactional
    public ApiResponse resetPassword(PasswordResetRequest resetRequest) {
        // 비밀번호와 확인 비밀번호 일치 확인
        if (!resetRequest.isPasswordMatch()) {
            return new ApiResponse(false, "비밀번호와 확인 비밀번호가 일치하지 않습니다.", null);
        }
        
        // 사용자 확인
        Optional<User> userOpt = userRepository.findByEmail(resetRequest.getEmail());
        if (userOpt.isEmpty()) {
            return new ApiResponse(false, "등록되지 않은 이메일입니다.", null);
        }
        
        User user = userOpt.get();
        
        // 인증 코드 확인
        Optional<VerificationToken> tokenOpt = tokenRepository.findByUserAndVerificationCode(user, resetRequest.getCode());
        
        if (tokenOpt.isEmpty()) {
            return new ApiResponse(false, "유효하지 않은 인증 코드입니다.", null);
        }
        
        VerificationToken verificationToken = tokenOpt.get();
        
        // 인증 코드 만료 확인
        if (verificationToken.isExpired()) {
            return new ApiResponse(false, "만료된 인증 코드입니다. 인증 코드를 재발송해주세요.", null);
        }
        
        // 비밀번호 업데이트
        user.setPassword(passwordEncoder.encode(resetRequest.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        // 사용된 토큰 삭제
        tokenRepository.delete(verificationToken);
        
        return new ApiResponse(true, "비밀번호가 재설정되었습니다. 새로운 비밀번호로 로그인하세요.", null);
    }
    
    /**
     * 아이디 사용 가능 여부 확인
     * @param username 사용자 아이디
     * @return 사용 가능 여부
     */
    public boolean isUsernameAvailable(String username) {
        return !userRepository.existsByUsername(username);
    }
    
    /**
     * 이메일 사용 가능 여부 확인
     * @param email 이메일
     * @return 사용 가능 여부
     */
    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(email);
    }
    
    /**
     * 아이디 중복 확인
     * @param username 사용자명
     * @return 중복 확인 결과
     */
    public UsernameAvailabilityResponse checkUsernameAvailability(String username) {
        boolean exists = userRepository.existsByUsername(username);
        return new UsernameAvailabilityResponse(!exists);
    }
    
    /**
     * 이메일 중복 확인
     * @param email 이메일
     * @return 중복 확인 결과
     */
    public EmailAvailabilityResponse checkEmailAvailability(String email) {
        boolean exists = userRepository.existsByEmail(email);
        return new EmailAvailabilityResponse(!exists);
    }
} 
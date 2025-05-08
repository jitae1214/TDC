package com.yhk.webchat.chat_backend.service;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yhk.webchat.chat_backend.dto.request.auth.EmailVerificationRequest;
import com.yhk.webchat.chat_backend.dto.request.auth.RegisterRequest;
import com.yhk.webchat.chat_backend.dto.response.auth.EmailAvailabilityResponse;
import com.yhk.webchat.chat_backend.dto.response.auth.EmailVerificationResponse;
import com.yhk.webchat.chat_backend.dto.response.auth.RegisterResponse;
import com.yhk.webchat.chat_backend.dto.response.auth.UsernameAvailabilityResponse;
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
     * 사용자 등록 (회원가입)
     * @param request 회원가입 요청 DTO
     * @return 회원가입 결과
     */
    @Transactional
    public RegisterResponse registerUser(RegisterRequest request) {
        try {
            // 아이디, 이메일 중복 검사
            if (userRepository.existsByUsername(request.getUsername())) {
                return new RegisterResponse("이미 사용 중인 아이디입니다.");
            }
            
            if (userRepository.existsByEmail(request.getEmail())) {
                return new RegisterResponse("이미 사용 중인 이메일입니다.");
            }
            
            // 사용자 생성
            User user = User.builder()
                    .username(request.getUsername())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .email(request.getEmail())
                    .fullName(request.getFullName())
                    .nickname(request.getNickname())
                    .profileImageUrl(request.getProfileImage()) // 프로필 이미지 URL 설정
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
            
            // 회원가입 시 자동으로 이메일을 발송하지 않음
            // 사용자가 이메일 인증 페이지에서 인증코드발송하기 버튼을 클릭할 때만 발송
            
            return new RegisterResponse(user.getId(), false);
            
        } catch (Exception e) {
            e.printStackTrace();
            return new RegisterResponse("회원가입 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    /**
     * 이메일 인증 처리 (인증 코드 방식)
     * @param email 이메일
     * @param verificationCode 인증 코드
     * @return 인증 결과
     */
    @Transactional
    public EmailVerificationResponse verifyEmail(EmailVerificationRequest request) {
        String email = request.getEmail();
        String verificationCode = request.getVerificationCode();
        
        if (email == null || email.isEmpty() || verificationCode == null || verificationCode.isEmpty()) {
            return new EmailVerificationResponse(false, "이메일과 인증 코드를 모두 입력해주세요.", null);
        }
        
        // 사용자 확인
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return new EmailVerificationResponse(false, "등록되지 않은 이메일입니다.", email);
        }
        
        User user = userOpt.get();
        
        // 이미 인증된 계정인지 확인
        if (user.isEmailVerified()) {
            return new EmailVerificationResponse(false, "이미 인증된 이메일입니다.", email);
        }
        
        // 인증 코드로 토큰 찾기
        Optional<VerificationToken> tokenOpt = tokenRepository.findByUserAndVerificationCode(user, verificationCode);
        
        if (tokenOpt.isEmpty()) {
            return new EmailVerificationResponse(false, "유효하지 않은 인증 코드입니다.", email);
        }
        
        VerificationToken verificationToken = tokenOpt.get();
        
        // 인증 코드 만료 확인
        if (verificationToken.isExpired()) {
            return new EmailVerificationResponse(false, "만료된 인증 코드입니다. 인증 코드를 재발송해주세요.", email);
        }
        
        // 이메일 인증 완료 처리
        user.setEmailVerified(true);
        userRepository.save(user);
        
        // 사용된 토큰 삭제
        tokenRepository.delete(verificationToken);
        
        return new EmailVerificationResponse(true, "이메일 인증이 완료되었습니다.", email);
    }
    
    /**
     * 이메일 인증 처리 (구 URL 토큰 방식 - 레거시 호환용)
     * @param token 인증 토큰
     * @return 인증 결과
     */
    @Transactional
    public EmailVerificationResponse verifyEmailByToken(String token) {
        Optional<VerificationToken> verificationTokenOpt = tokenRepository.findByToken(token);
        
        if (verificationTokenOpt.isEmpty()) {
            return new EmailVerificationResponse(false, "유효하지 않은 인증 토큰입니다.", null);
        }
        
        VerificationToken verificationToken = verificationTokenOpt.get();
        
        if (verificationToken.isExpired()) {
            return new EmailVerificationResponse(false, "만료된 인증 토큰입니다. 인증 메일을 재발송해주세요.", null);
        }
        
        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);
        
        // 토큰 사용 완료 후 삭제
        tokenRepository.delete(verificationToken);
        
        return new EmailVerificationResponse(true, "이메일 인증이 완료되었습니다.", user.getEmail());
    }
    
    /**
     * 인증 이메일 재발송
     * @param request 이메일 인증 요청 DTO
     * @return 발송 결과
     */
    @Transactional
    public EmailVerificationResponse resendVerificationEmail(EmailVerificationRequest request) {
        String email = request.getEmail();
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            return new EmailVerificationResponse(false, "등록되지 않은 이메일입니다.", email);
        }
        
        User user = userOpt.get();
        
        if (user.isEmailVerified()) {
            return new EmailVerificationResponse(false, "이미 인증된 이메일입니다.", email);
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
        
        // 인증 이메일 재발송
        try {
            emailService.sendVerificationEmail(
                user.getEmail(),
                "[채팅 웹] 이메일 인증 안내",
                verificationCode,
                user.getUsername(),
                user.getFullName()
            );
            return new EmailVerificationResponse(true, "인증 이메일이 재발송되었습니다.", email);
        } catch (Exception e) {
            return new EmailVerificationResponse(false, "이메일 발송 중 오류가 발생했습니다: " + e.getMessage(), email);
        }
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
package com.yhk.webchat.chat_backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.yhk.webchat.chat_backend.dto.request.auth.LoginRequest;
import com.yhk.webchat.chat_backend.dto.request.auth.PasswordResetRequest;
import com.yhk.webchat.chat_backend.dto.request.auth.RegisterRequest;
import com.yhk.webchat.chat_backend.dto.request.auth.VerifyCodeRequest;
import com.yhk.webchat.chat_backend.dto.response.ApiResponse;
import com.yhk.webchat.chat_backend.dto.response.auth.LoginResponse;
import com.yhk.webchat.chat_backend.model.User;
import com.yhk.webchat.chat_backend.repository.UserRepository;
import com.yhk.webchat.chat_backend.security.CurrentUser;
import com.yhk.webchat.chat_backend.service.LoginService;
import com.yhk.webchat.chat_backend.service.RegisterService;

import jakarta.validation.Valid;

/**
 * 인증 관련 API 컨트롤러
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private RegisterService registerService;
    
    @Autowired
    private LoginService loginService;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * 회원가입 API
     * @param registerRequest 회원가입 요청 데이터
     * @return 회원가입 결과
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        ApiResponse response = registerService.register(registerRequest);
        return ResponseEntity.status(response.isSuccess() ? 201 : 400).body(response);
    }
    
    /**
     * 로그인 API
     * @param loginRequest 로그인 요청 데이터
     * @return 로그인 결과
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = loginService.login(loginRequest);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 이메일 인증 코드 발송 API
     * @param email 이메일 주소
     * @return 발송 결과
     */
    @GetMapping("/send-verify-code")
    public ResponseEntity<ApiResponse> sendVerifyCode(@RequestParam String email) {
        ApiResponse response = registerService.sendVerificationCode(email);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 이메일 인증 코드 확인 API
     * @param verifyRequest 인증 코드 확인 요청 데이터
     * @return 확인 결과
     */
    @PostMapping("/verify-code")
    public ResponseEntity<ApiResponse> verifyCode(@Valid @RequestBody VerifyCodeRequest verifyRequest) {
        ApiResponse response = registerService.verifyCode(verifyRequest.getEmail(), verifyRequest.getCode());
        return ResponseEntity.ok(response);
    }
    
    /**
     * 비밀번호 재설정 API
     * @param resetRequest 비밀번호 재설정 요청 데이터
     * @return 재설정 결과
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@Valid @RequestBody PasswordResetRequest resetRequest) {
        ApiResponse response = registerService.resetPassword(resetRequest);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 아이디 중복 확인 API
     * @param username 사용자 아이디
     * @return 중복 여부
     */
    @GetMapping("/check-username")
    public ResponseEntity<Boolean> checkUsernameAvailability(@RequestParam String username) {
        boolean isAvailable = registerService.isUsernameAvailable(username);
        return ResponseEntity.ok(isAvailable);
    }
    
    /**
     * 이메일 중복 확인 API
     * @param email 이메일 주소
     * @return 중복 여부
     */
    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmailAvailability(@RequestParam String email) {
        boolean isAvailable = registerService.isEmailAvailable(email);
        return ResponseEntity.ok(isAvailable);
    }
    
    /**
     * JWT 토큰 검증 및 사용자 정보 조회 API
     * @param userDetails 현재 인증된 사용자 정보
     * @return 사용자 정보
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@CurrentUser UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new ApiResponse(false, "인증되지 않은 사용자입니다.", null));
        }
        
        // 사용자 정보 조회
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        // 응답 데이터 구성
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("nickname", user.getNickname());
        response.put("profileImageUrl", user.getProfileImageUrl());
        response.put("status", user.getStatus());
        response.put("emailVerified", user.isEmailVerified());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 로그아웃 API
     * @param userDetails 현재 인증된 사용자 정보
     * @return 로그아웃 결과
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout(@CurrentUser UserDetails userDetails) {
        if (userDetails != null) {
            // 사용자 상태 오프라인으로 업데이트
            userRepository.findByUsername(userDetails.getUsername())
                    .ifPresent(user -> {
                        user.setStatus("OFFLINE");
                        userRepository.save(user);
                    });
        }
        
        return ResponseEntity.ok(new ApiResponse(true, "로그아웃 되었습니다.", null));
    }
    
    /**
     * 토큰 검증 API
     * @param authHeader Authorization 헤더 값
     * @return 검증 결과
     */
    @GetMapping("/validate-token")
    public ResponseEntity<Map<String, Boolean>> validateToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        Map<String, Boolean> response = new HashMap<>();
        
        // 토큰이 없는 경우
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.put("valid", false);
            return ResponseEntity.ok(response);
        }
        
        // 토큰 추출 및 검증
        String token = authHeader.substring(7);
        boolean isValid = loginService.validateToken(token);
        
        response.put("valid", isValid);
        return ResponseEntity.ok(response);
    }
} 
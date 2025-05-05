package com.yhk.webchat.chat_backend.controller;

import com.yhk.webchat.chat_backend.dto.LoginResponse;
import com.yhk.webchat.chat_backend.dto.SocialLoginRequest;
import com.yhk.webchat.chat_backend.dto.SocialUserInfo;
import com.yhk.webchat.chat_backend.model.User;
import com.yhk.webchat.chat_backend.service.SocialLoginService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 소셜 로그인 컨트롤러
 * 소셜 로그인 처리를 담당
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class SocialLoginController {
    
    private final SocialLoginService socialLoginService;
    
    @Value("${spring.security.oauth2.client.registration.kakao.client-id}")
    private String kakaoClientId;
    
    @Value("${spring.security.oauth2.client.registration.kakao.redirect-uri}")
    private String kakaoRedirectUri;
    
    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;
    
    @Value("${spring.security.oauth2.client.registration.google.redirect-uri}")
    private String googleRedirectUri;
    
    @Value("${spring.security.oauth2.client.registration.naver.client-id}")
    private String naverClientId;
    
    @Value("${spring.security.oauth2.client.registration.naver.redirect-uri}")
    private String naverRedirectUri;
    
    /**
     * 소셜 로그인 처리
     * @param request 소셜 로그인 요청 정보
     * @return 로그인 응답
     */
    @PostMapping("/social-login")
    public ResponseEntity<LoginResponse> socialLogin(@RequestBody SocialLoginRequest request) {
        log.info("소셜 로그인 요청: provider={}, code={}", request.getProvider(), request.getCode().substring(0, 10) + "...");
        
        try {
            // 지원하는 소셜 로그인 제공자 확인
            if (!"kakao".equals(request.getProvider()) && 
                !"google".equals(request.getProvider()) && 
                !"naver".equals(request.getProvider())) {
                return ResponseEntity.badRequest().body(
                    new LoginResponse(false, "지원하지 않는 소셜 로그인 제공자입니다.", null, null)
                );
            }
            
            // 코드 존재 여부 확인
            if (request.getCode() == null || request.getCode().isEmpty()) {
                return ResponseEntity.badRequest().body(
                    new LoginResponse(false, "인증 코드가 없습니다.", null, null)
                );
            }
            
            String accessToken;
            SocialUserInfo userInfo;
            
            // 소셜 로그인 제공자에 따라 처리
            if ("kakao".equals(request.getProvider())) {
                accessToken = socialLoginService.getKakaoAccessToken(request.getCode());
                userInfo = socialLoginService.getKakaoUserInfo(accessToken);
            } else if ("google".equals(request.getProvider())) {
                accessToken = socialLoginService.getGoogleAccessToken(request.getCode());
                userInfo = socialLoginService.getGoogleUserInfo(accessToken);
            } else { // naver
                accessToken = socialLoginService.getNaverAccessToken(request.getCode());
                userInfo = socialLoginService.getNaverUserInfo(accessToken);
            }
            
            // 사용자 정보 조회 또는 생성
            User user = socialLoginService.findOrCreateSocialUser(userInfo);
            
            // 유저 정보 없으면 에러
            if (user == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new LoginResponse(false, "사용자 정보를 처리할 수 없습니다.", null, null)
                );
            }
            
            // 마지막 로그인 시간 업데이트
            user.setLastLoginAt(LocalDateTime.now());
            socialLoginService.updateUser(user);
            
            // JWT 토큰 생성
            String jwtToken = socialLoginService.generateToken(user.getUsername());
            
            return ResponseEntity.ok(new LoginResponse(
                true,
                "소셜 로그인 성공",
                jwtToken,
                user.getUsername())
            );
        } catch (Exception e) {
            log.error("소셜 로그인 처리 중 오류 발생", e);
            Map<String, String> errorInfo = new HashMap<>();
            errorInfo.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new LoginResponse(false, "소셜 로그인 처리 중 오류가 발생했습니다: " + e.getMessage(), null, null)
            );
        }
    }
    
    /**
     * 카카오 로그인 정보 조회
     * @return 카카오 로그인 정보
     */
    @GetMapping("/kakao-info")
    public ResponseEntity<Map<String, String>> getKakaoInfo() {
        Map<String, String> info = new HashMap<>();
        try {
            info.put("clientId", kakaoClientId);
            info.put("redirectUri", kakaoRedirectUri);
            
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            info.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(info);
        }
    }
    
    /**
     * 구글 로그인 정보 조회
     * @return 구글 로그인 정보
     */
    @GetMapping("/google-info")
    public ResponseEntity<Map<String, String>> getGoogleInfo() {
        Map<String, String> info = new HashMap<>();
        try {
            info.put("clientId", googleClientId);
            info.put("redirectUri", googleRedirectUri);
            
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            info.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(info);
        }
    }
    
    /**
     * 네이버 로그인 정보 조회
     * @return 네이버 로그인 정보
     */
    @GetMapping("/naver-info")
    public ResponseEntity<Map<String, String>> getNaverInfo() {
        Map<String, String> info = new HashMap<>();
        try {
            info.put("clientId", naverClientId);
            info.put("redirectUri", naverRedirectUri);
            
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            info.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(info);
        }
    }
} 
package com.yhk.webchat.chat_backend.controller;

import com.yhk.webchat.chat_backend.dto.LoginResponse;
import com.yhk.webchat.chat_backend.dto.SocialLoginRequest;
import com.yhk.webchat.chat_backend.dto.SocialUserInfo;
import com.yhk.webchat.chat_backend.model.User;
import com.yhk.webchat.chat_backend.service.SocialLoginService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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
@RestController
@RequestMapping("/api/auth")
public class SocialLoginController {
    
    private static final Logger log = LoggerFactory.getLogger(SocialLoginController.class);
    
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
    
    @Autowired
    public SocialLoginController(SocialLoginService socialLoginService) {
        this.socialLoginService = socialLoginService;
    }
    
    /**
     * 소셜 로그인 처리
     * @param request 소셜 로그인 요청 정보
     * @return 로그인 응답
     */
    @PostMapping("/social-login")
    public ResponseEntity<LoginResponse> socialLogin(@RequestBody SocialLoginRequest request) {
        log.info("소셜 로그인 요청: provider={}, code={}", request.getProvider(), request.getCode().substring(0, 10) + "...");
        
        try {
            // 요청 정보 로그 추가
            System.out.println("=============================================");
            System.out.println("소셜 로그인 요청 시작");
            System.out.println("- 제공자: " + request.getProvider());
            System.out.println("- 코드 길이: " + (request.getCode() != null ? request.getCode().length() : "null"));
            
            // 지원하는 소셜 로그인 사용자 확인
            if (!"kakao".equals(request.getProvider()) && 
                !"google".equals(request.getProvider()) && 
                !"naver".equals(request.getProvider())) {
                log.warn("지원하지 않는 소셜 로그인 제공자: {}", request.getProvider());
                return ResponseEntity.badRequest().body(
                    new LoginResponse(false, "지원하지 않는 소셜 로그인 사용자.", null, null)
                );
            }
            
            // 코드 존재 여부 확인
            if (request.getCode() == null || request.getCode().isEmpty()) {
                log.warn("소셜 로그인 인증 코드 없음");
                return ResponseEntity.badRequest().body(
                    new LoginResponse(false, "인증 코드가 없습니다.", null, null)
                );
            }
            
            String accessToken;
            SocialUserInfo userInfo;
            
            // 소셜 로그인 제공자에 따라 처리
            if ("kakao".equals(request.getProvider())) {
                System.out.println("카카오 로그인 처리 시작");
                accessToken = socialLoginService.getKakaoAccessToken(request.getCode());
                System.out.println("카카오 액세스 토큰 획득 성공: " + (accessToken != null && !accessToken.isEmpty()));
                userInfo = socialLoginService.getKakaoUserInfo(accessToken);
                System.out.println("카카오 사용자 정보 획득 성공: " + (userInfo != null));
            } else if ("google".equals(request.getProvider())) {
                System.out.println("구글 로그인 처리 시작");
                accessToken = socialLoginService.getGoogleAccessToken(request.getCode());
                userInfo = socialLoginService.getGoogleUserInfo(accessToken);
            } else { // naver
                System.out.println("네이버 로그인 처리 시작");
                accessToken = socialLoginService.getNaverAccessToken(request.getCode());
                userInfo = socialLoginService.getNaverUserInfo(accessToken);
            }
            
            if (userInfo == null) {
                log.error("소셜 로그인 사용자 정보를 가져오지 못했습니다");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new LoginResponse(false, "사용자 정보를 가져오지 못했습니다.", null, null)
                );
            }
            
            System.out.println("소셜 사용자 정보:");
            System.out.println("- ID: " + userInfo.getSocialId());
            System.out.println("- 제공자: " + userInfo.getProvider());
            System.out.println("- 이메일: " + userInfo.getEmail());
            System.out.println("- 이름: " + userInfo.getNickname());
            
            // 사용자 정보 조회 또는 생성
            User user = socialLoginService.findOrCreateSocialUser(userInfo);
            
            // 유저 정보 없으면 에러
            if (user == null) {
                log.error("소셜 로그인 사용자 정보 처리 실패");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new LoginResponse(false, "사용자 정보를 처리할 수 없습니다.", null, null)
                );
            }
            
            // 마지막 로그인 시간 업데이트 및 상태 ONLINE으로 설정
            user.setLastLoginAt(LocalDateTime.now());
            user.setStatus("ONLINE");  // 사용자 상태를 항상 ONLINE으로 설정
            socialLoginService.updateUser(user);
            
            System.out.println("사용자 상태 ONLINE으로 설정: " + user.getUsername());
            
            // JWT 토큰 생성
            String jwtToken = socialLoginService.generateToken(user.getUsername());
            System.out.println("JWT 토큰 생성 성공: " + (jwtToken != null && !jwtToken.isEmpty()));
            
            // 디버그 로그 추가
            log.info("소셜 로그인 성공: provider={}, username={}, userInfo.profileImage={}, user.profileImageUrl={}",
                    request.getProvider(),
                    user.getUsername(),
                    userInfo.getProfileImage(),
                    user.getProfileImageUrl());
            
            // 프로필 이미지 URL 결정
            String profileImageUrl = user.getProfileImageUrl();
            
            // User 엔티티에 이미지가 없고 userInfo에 이미지가 있으면 userInfo의 이미지 사용
            if ((profileImageUrl == null || profileImageUrl.isEmpty()) && 
                userInfo.getProfileImage() != null && !userInfo.getProfileImage().isEmpty()) {
                profileImageUrl = userInfo.getProfileImage();
                
                // User 엔티티에도 저장
                user.setProfileImageUrl(profileImageUrl);
                socialLoginService.updateUser(user);
            }
            
            // 로그인 성공 응답에 프로필 이미지 URL과 닉네임 추가
            LoginResponse response = new LoginResponse(
                true,
                "소셜 로그인 성공",
                jwtToken,
                user.getUsername(),
                user.getSocialId(),
                request.getProvider(),
                "/main",
                profileImageUrl,
                user.getNickname() // 닉네임 추가
            );
            
            System.out.println("소셜 로그인 처리 완료 - 토큰: " + (jwtToken != null ? jwtToken.substring(0, 20) + "..." : "null"));
            System.out.println("=============================================");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("소셜 로그인 처리 중 오류 발생", e);
            System.err.println("소셜 로그인 처리 중 예외 발생: " + e.getMessage());
            e.printStackTrace();
            
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
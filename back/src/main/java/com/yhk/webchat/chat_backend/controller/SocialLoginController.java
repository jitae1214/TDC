package com.yhk.webchat.chat_backend.controller;

import com.yhk.webchat.chat_backend.dto.LoginResponse;
import com.yhk.webchat.chat_backend.dto.SocialLoginRequest;
import com.yhk.webchat.chat_backend.dto.SocialUserInfo;
import com.yhk.webchat.chat_backend.model.User;
import com.yhk.webchat.chat_backend.service.LoginService;
import com.yhk.webchat.chat_backend.service.SocialLoginService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.Map;

/**
 * 소셜 로그인 컨트롤러
 */
@RestController
@RequestMapping("/api/auth")
public class SocialLoginController {
    
    private static final Logger logger = LoggerFactory.getLogger(SocialLoginController.class);

    private final SocialLoginService socialLoginService;
    private final LoginService loginService;
    
    @Value("${spring.security.oauth2.client.registration.kakao.client-id}")
    private String kakaoClientId;
    
    @Value("${spring.security.oauth2.client.registration.kakao.redirect-uri}")
    private String kakaoRedirectUri;

    @Autowired
    public SocialLoginController(SocialLoginService socialLoginService, LoginService loginService) {
        this.socialLoginService = socialLoginService;
        this.loginService = loginService;
    }

    /**
     * 소셜 로그인 처리
     * @param request 소셜 로그인 요청 데이터 (인증 코드, 제공자)
     * @return 인증 결과
     */
    @PostMapping("/social-login")
    public ResponseEntity<LoginResponse> socialLogin(@RequestBody SocialLoginRequest request) {
        logger.info("소셜 로그인 요청 시작: provider={}, code={}", 
                request.getProvider(), 
                request.getCode() != null ? request.getCode().substring(0, Math.min(10, request.getCode().length())) + "..." : "null");
        
        try {
            // 요청 검증
            if (request.getCode() == null || request.getProvider() == null) {
                logger.error("소셜 로그인 요청 유효성 검증 실패: 코드 또는 제공자 누락");
                return ResponseEntity.badRequest().body(
                        new LoginResponse(false, "인증 코드와 제공자가 필요합니다.", null, null));
            }

            // 현재는 카카오만 지원
            if (!"kakao".equals(request.getProvider())) {
                logger.error("지원하지 않는 소셜 로그인 제공자: {}", request.getProvider());
                return ResponseEntity.badRequest().body(
                        new LoginResponse(false, "지원하지 않는 로그인 제공자입니다.", null, null));
            }

            logger.debug("소셜 로그인 인증 코드 교환 시작: provider={}", request.getProvider());
            
            // 1. 소셜 인증 코드로 액세스 토큰 요청
            String accessToken = socialLoginService.getKakaoAccessToken(request.getCode());
            logger.debug("카카오 액세스 토큰 획득 성공");
            
            // 2. 액세스 토큰으로 사용자 정보 요청
            SocialUserInfo userInfo = socialLoginService.getKakaoUserInfo(accessToken);
            logger.debug("카카오 사용자 정보 획득 성공: socialId={}, nickname={}, email={}",
                    userInfo.getSocialId(), 
                    userInfo.getNickname(),
                    userInfo.getEmail() != null ? (userInfo.getEmail().substring(0, Math.min(3, userInfo.getEmail().length())) + "...") : "null");
            
            // 3. 사용자 정보로 회원가입 또는 로그인 처리
            User user = socialLoginService.findOrCreateSocialUser(userInfo);
            logger.debug("소셜 사용자 처리 완료: username={}, isNew={}", 
                    user.getUsername(), 
                    user.getCreatedAt() != null && System.currentTimeMillis() - user.getCreatedAt().toEpochSecond(ZoneOffset.UTC) < 10);
            
            // 4. JWT 토큰 생성
            String jwtToken = loginService.generateToken(user.getUsername());
            logger.debug("JWT 토큰 생성 완료: username={}", user.getUsername());
            
            // 5. 결과 반환
            logger.info("소셜 로그인 성공: username={}, provider={}", user.getUsername(), user.getProvider());
            return ResponseEntity.ok(new LoginResponse(
                    true,
                    "소셜 로그인 성공",
                    jwtToken,
                    user.getUsername(),
                    user.getSocialId(),
                    user.getProvider()
            ));
        } catch (Exception e) {
            logger.error("소셜 로그인 처리 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new LoginResponse(false, "소셜 로그인 처리 중 오류: " + e.getMessage(), null, null));
        }
    }

    /**
     * 카카오 로그인 인증 정보 확인
     * @return 카카오 인증 정보
     */
    @GetMapping("/kakao-info")
    public ResponseEntity<Map<String, String>> getKakaoInfo() {
        Map<String, String> info = new HashMap<>();
        try {
            info.put("clientId", kakaoClientId);
            info.put("redirectUri", kakaoRedirectUri);
            logger.info("카카오 인증 정보 요청: clientId={}, redirectUri={}", 
                    kakaoClientId, kakaoRedirectUri);
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            logger.error("카카오 인증 정보 요청 처리 중 오류", e);
            info.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(info);
        }
    }
} 
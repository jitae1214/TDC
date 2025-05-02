package com.yhk.webchat.chat_backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yhk.webchat.chat_backend.dto.SocialUserInfo;
import com.yhk.webchat.chat_backend.model.User;
import com.yhk.webchat.chat_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class SocialLoginService {

    @Value("${spring.security.oauth2.client.registration.kakao.client-id}")
    private String kakaoClientId;

    @Value("${spring.security.oauth2.client.registration.kakao.client-secret}")
    private String kakaoClientSecret;

    @Value("${spring.security.oauth2.client.registration.kakao.redirect-uri}")
    private String kakaoRedirectUri;

    @Value("${spring.security.oauth2.client.provider.kakao.token-uri}")
    private String kakaoTokenUri;

    @Value("${spring.security.oauth2.client.provider.kakao.user-info-uri}")
    private String kakaoUserInfoUri;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Autowired
    public SocialLoginService(UserRepository userRepository,
                              PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * 소셜 인증 코드로 액세스 토큰 요청
     */
    public String getKakaoAccessToken(String code) {
        // HTTP 헤더 생성
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-type", "application/x-www-form-urlencoded;charset=utf-8");

        // HTTP 요청 파라미터 생성
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", kakaoClientId);
        params.add("client_secret", kakaoClientSecret);
        params.add("redirect_uri", kakaoRedirectUri);
        params.add("code", code);

        // HTTP 요청 엔티티 생성
        HttpEntity<MultiValueMap<String, String>> kakaoTokenRequest = new HttpEntity<>(params, headers);

        // 카카오 토큰 요청
        ResponseEntity<String> response = restTemplate.exchange(
                kakaoTokenUri,
                HttpMethod.POST,
                kakaoTokenRequest,
                String.class
        );

        // 응답에서 액세스 토큰 추출
        try {
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            return jsonNode.get("access_token").asText();
        } catch (JsonProcessingException e) {
            throw new RuntimeException("카카오 액세스 토큰 파싱 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 카카오 액세스 토큰으로 사용자 정보 요청
     */
    public SocialUserInfo getKakaoUserInfo(String accessToken) {
        // HTTP 헤더 생성
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + accessToken);
        headers.add("Content-type", "application/x-www-form-urlencoded;charset=utf-8");

        // HTTP 요청 엔티티 생성
        HttpEntity<MultiValueMap<String, String>> kakaoUserInfoRequest = new HttpEntity<>(headers);

        // 카카오 사용자 정보 요청
        ResponseEntity<String> response = restTemplate.exchange(
                kakaoUserInfoUri,
                HttpMethod.GET,
                kakaoUserInfoRequest,
                String.class
        );

        // 응답에서 사용자 정보 추출
        try {
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            
            // 사용자 정보 추출
            String id = jsonNode.get("id").asText();
            String nickname = jsonNode.path("properties").path("nickname").asText();
            String profileImage = jsonNode.path("properties").path("profile_image").asText();
            String email = jsonNode.path("kakao_account").path("email").asText("");
            
            // 추가 정보 저장
            Map<String, Object> additionalInfo = new HashMap<>();
            if (jsonNode.has("connected_at")) {
                additionalInfo.put("connected_at", jsonNode.get("connected_at").asText());
            }
            
            // 소셜 사용자 정보 객체 생성
            return new SocialUserInfo(
                    id,
                    "kakao",
                    email,
                    nickname,
                    profileImage,
                    additionalInfo
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException("카카오 사용자 정보 파싱 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 소셜 로그인 사용자 찾기 또는 생성
     */
    @Transactional
    public User findOrCreateSocialUser(SocialUserInfo userInfo) {
        // 소셜 ID와 제공자로 사용자 조회
        Optional<User> existingUser = userRepository.findBySocialIdAndProvider(
                userInfo.getSocialId(), userInfo.getProvider());
        
        if (existingUser.isPresent()) {
            // 기존 사용자 반환
            return existingUser.get();
        }
        
        // 이메일로 사용자 조회 (이미 가입된 이메일인 경우 연동)
        if (userInfo.getEmail() != null && !userInfo.getEmail().isEmpty()) {
            Optional<User> userByEmail = userRepository.findByEmail(userInfo.getEmail());
            if (userByEmail.isPresent()) {
                User user = userByEmail.get();
                user.setSocialId(userInfo.getSocialId());
                user.setProvider(userInfo.getProvider());
                return userRepository.save(user);
            }
        }
        
        // 새 사용자 생성
        User newUser = new User();
        newUser.setSocialId(userInfo.getSocialId());
        newUser.setProvider(userInfo.getProvider());
        
        // 이메일 설정 (없는 경우 임의 생성)
        if (userInfo.getEmail() != null && !userInfo.getEmail().isEmpty()) {
            newUser.setEmail(userInfo.getEmail());
        } else {
            String randomSuffix = UUID.randomUUID().toString().substring(0, 8);
            newUser.setEmail(userInfo.getProvider() + "_" + userInfo.getSocialId() + "_" + randomSuffix + "@example.com");
        }
        
        // 사용자 이름 생성
        String username = generateUsername(userInfo);
        newUser.setUsername(username);
        
        // 닉네임 설정
        if (userInfo.getNickname() != null && !userInfo.getNickname().isEmpty()) {
            newUser.setNickname(userInfo.getNickname());
        } else {
            newUser.setNickname(username);
        }
        
        // 프로필 이미지 설정
        if (userInfo.getProfileImage() != null && !userInfo.getProfileImage().isEmpty()) {
            newUser.setProfileImageUrl(userInfo.getProfileImage());
        }
        
        // 기타 필수 정보 설정
        newUser.setStatus("ONLINE");
        newUser.setEmailVerified(true); // 소셜 로그인은 이메일 인증 완료로 처리
        newUser.setCreatedAt(LocalDateTime.now());
        
        // 소셜 로그인 사용자는 임의의 비밀번호 생성
        String randomPassword = UUID.randomUUID().toString();
        newUser.setPassword(passwordEncoder.encode(randomPassword));
        
        // 저장 후 반환
        return userRepository.save(newUser);
    }

    /**
     * 소셜 로그인 사용자의 사용자 이름 생성
     */
    private String generateUsername(SocialUserInfo userInfo) {
        String prefix = userInfo.getProvider().substring(0, 1).toUpperCase();
        String basicUsername = prefix + "_" + userInfo.getSocialId();
        
        // 중복 확인
        if (!userRepository.existsByUsername(basicUsername)) {
            return basicUsername;
        }
        
        // 중복인 경우 랜덤 문자열 추가
        return basicUsername + "_" + UUID.randomUUID().toString().substring(0, 8);
    }
} 
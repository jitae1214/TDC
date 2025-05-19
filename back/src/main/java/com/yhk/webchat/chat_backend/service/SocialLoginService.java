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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import java.time.LocalDateTime;
import java.util.Date;
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

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;

    @Value("${spring.security.oauth2.client.registration.google.redirect-uri}")
    private String googleRedirectUri;

    @Value("${spring.security.oauth2.client.provider.google.token-uri}")
    private String googleTokenUri;

    @Value("${spring.security.oauth2.client.provider.google.user-info-uri}")
    private String googleUserInfoUri;

    @Value("${spring.security.oauth2.client.registration.naver.client-id}")
    private String naverClientId;

    @Value("${spring.security.oauth2.client.registration.naver.client-secret}")
    private String naverClientSecret;

    @Value("${spring.security.oauth2.client.registration.naver.redirect-uri}")
    private String naverRedirectUri;

    @Value("${spring.security.oauth2.client.provider.naver.token-uri}")
    private String naverTokenUri;

    @Value("${spring.security.oauth2.client.provider.naver.user-info-uri}")
    private String naverUserInfoUri;
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration}")
    private long jwtExpiration;

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
        try {
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
    
            // 로그 추가
            System.out.println("카카오 토큰 요청 정보:");
            System.out.println("- client_id: " + kakaoClientId);
            System.out.println("- redirect_uri: " + kakaoRedirectUri);
            System.out.println("- code 길이: " + (code != null ? code.length() : "null"));
            System.out.println("- 토큰 요청 URL: " + kakaoTokenUri);
    
            // HTTP 요청 엔티티 생성
            HttpEntity<MultiValueMap<String, String>> kakaoTokenRequest = new HttpEntity<>(params, headers);
    
            // 카카오 토큰 요청
            ResponseEntity<String> response = restTemplate.exchange(
                    kakaoTokenUri,
                    HttpMethod.POST,
                    kakaoTokenRequest,
                    String.class
            );
    
            // 응답 로그 추가
            System.out.println("카카오 토큰 응답 상태: " + response.getStatusCode());
            System.out.println("카카오 토큰 응답 본문: " + response.getBody());
    
            // 응답에서 액세스 토큰 추출
            try {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                String accessToken = jsonNode.get("access_token").asText();
                System.out.println("카카오 액세스 토큰 생성 성공: " + (accessToken != null && !accessToken.isEmpty()));
                return accessToken;
            } catch (JsonProcessingException e) {
                System.err.println("카카오 액세스 토큰 파싱 중 오류: " + e.getMessage());
                throw new RuntimeException("카카오 액세스 토큰 파싱 중 오류가 발생했습니다.", e);
            }
        } catch (Exception e) {
            System.err.println("카카오 토큰 요청 중 예외 발생: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("카카오 토큰 요청 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 카카오 액세스 토큰으로 사용자 정보 요청
     */
    public SocialUserInfo getKakaoUserInfo(String accessToken) {
        try {
            // HTTP 헤더 생성
            HttpHeaders headers = new HttpHeaders();
            headers.add("Authorization", "Bearer " + accessToken);
            headers.add("Content-type", "application/x-www-form-urlencoded;charset=utf-8");
    
            // 로그 추가
            System.out.println("카카오 사용자 정보 요청:");
            System.out.println("- 액세스 토큰 존재 여부: " + (accessToken != null && !accessToken.isEmpty()));
            System.out.println("- 사용자 정보 요청 URL: " + kakaoUserInfoUri);
    
            // HTTP 요청 엔티티 생성
            HttpEntity<MultiValueMap<String, String>> kakaoUserInfoRequest = new HttpEntity<>(headers);
    
            // 카카오 사용자 정보 요청
            ResponseEntity<String> response = restTemplate.exchange(
                    kakaoUserInfoUri,
                    HttpMethod.GET,
                    kakaoUserInfoRequest,
                    String.class
            );
    
            // 응답 로그 추가
            System.out.println("카카오 사용자 정보 응답 상태: " + response.getStatusCode());
            System.out.println("카카오 사용자 정보 응답 본문: " + response.getBody());
    
            // 응답에서 사용자 정보 추출
            try {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                
                // 사용자 정보 추출
                String id = jsonNode.get("id").asText(); // 카카오 고유 ID가 여기 들어감
                String nickname = jsonNode.path("properties").path("nickname").asText();
                String profileImage = jsonNode.path("properties").path("profile_image").asText();
                String email = jsonNode.path("kakao_account").path("email").asText("");
                
                // 로그 추가
                System.out.println("카카오 사용자 정보 추출 결과:");
                System.out.println("- 소셜 ID: " + id);
                System.out.println("- 이메일: " + email);
                System.out.println("- 닉네임: " + nickname);
                System.out.println("- 프로필 이미지: " + (profileImage != null && !profileImage.isEmpty() ? "있음" : "없음"));
                
                // 추가 정보 저장
                Map<String, Object> additionalInfo = new HashMap<>();
                if (jsonNode.has("connected_at")) {
                    additionalInfo.put("connected_at", jsonNode.get("connected_at").asText());
                }
                
                // 소셜 사용자 정보 객체 생성
                SocialUserInfo userInfo = new SocialUserInfo(
                        id, // 카카오 고유 ID가 여기 들어감
                        "kakao",
                        email,
                        nickname,
                        profileImage
                );
                userInfo.setAdditionalInfo(additionalInfo);
                
                System.out.println("카카오 사용자 정보 객체 생성 완료");
                return userInfo;
            } catch (JsonProcessingException e) {
                System.err.println("카카오 사용자 정보 파싱 중 오류: " + e.getMessage());
                throw new RuntimeException("카카오 사용자 정보 파싱 중 오류가 발생", e);
            }
        } catch (Exception e) {
            System.err.println("카카오 사용자 정보 요청 중 예외 발생: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("카카오 사용자 정보 요청 중 오류가 발생했습니다.", e);
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
        // 사용자 이름 첫글자를 대문자로 변환
        String prefix = userInfo.getProvider().substring(0, 1).toUpperCase();
        String basicUsername = prefix + "_" + userInfo.getSocialId();
        
        // 중복 확인
        if (!userRepository.existsByUsername(basicUsername)) {
            return basicUsername;
        }
        
        // 중복인 경우 랜덤 문자열 추가
        return basicUsername + "_" + UUID.randomUUID().toString().substring(0, 8);
    }

    /**
     * 구글 액세스 토큰 획득
     * 인증 코드를 통해 액세스 토큰을 요청
     * @param code 인증 코드
     * @return 액세스 토큰
     */
    public String getGoogleAccessToken(String code) {
        // REST API 호출을 위한 RestTemplate
        RestTemplate restTemplate = new RestTemplate();
        
        // 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        // 파라미터 설정
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", googleClientId);
        params.add("client_secret", googleClientSecret);
        params.add("redirect_uri", googleRedirectUri);
        params.add("grant_type", "authorization_code");
        
        // HttpEntity 객체 생성
        HttpEntity<MultiValueMap<String, String>> googleTokenRequest = 
            new HttpEntity<>(params, headers);
        
        // POST 요청
        ResponseEntity<String> response = restTemplate.exchange(
            googleTokenUri,
            HttpMethod.POST,
            googleTokenRequest,
            String.class
        );
        
        // JSON 파싱
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode jsonNode;
        
        try {
            jsonNode = objectMapper.readTree(response.getBody());
            return jsonNode.get("access_token").asText();
        } catch (Exception e) {
            throw new RuntimeException("구글 토큰 파싱 중 오류 발생", e);
        }
    }
    
    /**
     * 구글 사용자 정보 획득
     * 액세스 토큰을 통해 사용자 정보를 요청
     * @param accessToken 액세스 토큰
     * @return 사용자 정보
     */
    public SocialUserInfo getGoogleUserInfo(String accessToken) {
        // REST API 호출을 위한 RestTemplate
        RestTemplate restTemplate = new RestTemplate();
        
        // 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        
        // HttpEntity 객체 생성
        HttpEntity<MultiValueMap<String, String>> googleUserInfoRequest = 
            new HttpEntity<>(headers);
        
        // GET 요청
        ResponseEntity<String> response = restTemplate.exchange(
            googleUserInfoUri,
            HttpMethod.GET,
            googleUserInfoRequest,
            String.class
        );
        
        // JSON 파싱
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode jsonNode;
        
        try {
            jsonNode = objectMapper.readTree(response.getBody());
            
            String socialId = jsonNode.path("sub").asText(); // 구글 API에서 제공하는 고유번호 가져옴
            String email = jsonNode.path("email").asText("");
            String name = jsonNode.path("name").asText("");
            String picture = jsonNode.path("picture").asText("");
            
            return new SocialUserInfo(
                socialId, // 구글 고유 ID가 여기 들어감
                "google",
                email, 
                name, 
                picture
            );
        } catch (Exception e) {
            throw new RuntimeException("구글 사용자 정보 파싱 중 오류 발생", e);
        }
    }

    /**
     * 네이버 액세스 토큰 획득
     * 인증 코드를 통해 액세스 토큰을 요청
     * @param code 인증 코드
     * @return 액세스 토큰
     */
    public String getNaverAccessToken(String code) {
        // REST API 호출을 위한 RestTemplate
        RestTemplate restTemplate = new RestTemplate();
        
        // 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        // 파라미터 설정
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", naverClientId);
        params.add("client_secret", naverClientSecret);
        params.add("redirect_uri", naverRedirectUri);
        params.add("grant_type", "authorization_code");
        
        // HttpEntity 객체 생성
        HttpEntity<MultiValueMap<String, String>> naverTokenRequest = 
            new HttpEntity<>(params, headers);
        
        // POST 요청
        ResponseEntity<String> response = restTemplate.exchange(
            naverTokenUri,
            HttpMethod.POST,
            naverTokenRequest,
            String.class
        );
        
        // JSON 파싱
        try {
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            return jsonNode.get("access_token").asText();
        } catch (Exception e) {
            throw new RuntimeException("네이버 토큰 파싱 중 오류 발생", e);
        }
    }

    /**
     * 네이버 사용자 정보 획득
     * 액세스 토큰을 통해 사용자 정보를 요청
     * @param accessToken 액세스 토큰
     * @return 사용자 정보
     */
    public SocialUserInfo getNaverUserInfo(String accessToken) {
        // REST API 호출을 위한 RestTemplate
        RestTemplate restTemplate = new RestTemplate();
        
        // 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        
        // HttpEntity 객체 생성
        HttpEntity<MultiValueMap<String, String>> naverUserInfoRequest = 
            new HttpEntity<>(headers);
        
        // GET 요청
        ResponseEntity<String> response = restTemplate.exchange(
            naverUserInfoUri,
            HttpMethod.GET,
            naverUserInfoRequest,
            String.class
        );
        
        // JSON 파싱
        try {
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            JsonNode responseNode = jsonNode.get("response");
            
            if (responseNode == null) {
                throw new RuntimeException("네이버 사용자 정보에 response 필드가 없습니다.");
            }
            
            String socialId = responseNode.path("id").asText(); // 네이버 API에서 제공하는 고유번호 가져옴
            String email = responseNode.path("email").asText("");
            String name = responseNode.path("name").asText("");
            String nickname = responseNode.path("nickname").asText("");
            if (nickname.isEmpty()) {
                nickname = name;
            }
            String profileImage = responseNode.path("profile_image").asText("");
            
            Map<String, Object> additionalInfo = new HashMap<>();
            if (responseNode.has("age")) {
                additionalInfo.put("age", responseNode.get("age").asText());
            }
            if (responseNode.has("gender")) {
                additionalInfo.put("gender", responseNode.get("gender").asText());
            }
            if (responseNode.has("mobile")) {
                additionalInfo.put("mobile", responseNode.get("mobile").asText());
            }
            
            SocialUserInfo userInfo = new SocialUserInfo(
                socialId,  // 네이버 고유 ID가 여기 들어감
                "naver",
                email, 
                nickname, 
                profileImage
            );
            userInfo.setAdditionalInfo(additionalInfo);
            return userInfo;
        } catch (Exception e) {
            throw new RuntimeException("네이버 사용자 정보 파싱 중 오류 발생", e);
        }
    }

    /**
     * 사용자 정보 업데이트
     */
    @Transactional
    public User updateUser(User user) {
        return userRepository.save(user);
    }
    
    /**
     * JWT 토큰 생성
     */
    public String generateToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);
        
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()), SignatureAlgorithm.HS256)
                .compact();
    }
} 
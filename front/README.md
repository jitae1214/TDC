# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

# Front-end Project

## 카카오 소셜 로그인 구현

### 프론트엔드 구현 (완료)

1. 소셜 로그인 서비스 API (`src/api/socialAuthService.ts`)
   - 카카오 로그인 URL 반환 함수
   - 소셜 인증 코드 처리 함수

2. 카카오 로그인 버튼 컴포넌트 (`src/components/KakaoLoginButton.tsx`)
   - 카카오 로그인 페이지로 리다이렉트

3. 카카오 콜백 처리 컴포넌트 (`src/pages/auth/KakaoCallback.tsx`)
   - 인증 코드 추출 및 백엔드로 전송
   - 로그인 성공/실패 시 UI 처리

4. 로그인 페이지 업데이트 (`src/pages/login/ui/index.tsx`)
   - 카카오 로그인 버튼 추가

5. 라우트 추가 (`src/app/routes/AppRoutes.js`)
   - 카카오 콜백 URL 처리 경로 추가

### 백엔드 구현 (필요)

백엔드(Spring Boot)에서는 다음과 같은 구현이 필요합니다:

#### 1. pom.xml에 의존성 추가

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>
```

#### 2. application.yml 설정 추가

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          kakao:
            client-id: 7a8ccc15d52d94a934242f9807ffe8ff
            client-secret: bGW19RVLsirJ3pDsNRxMqJWuvtGkmAux
            redirect-uri: "{baseUrl}/auth/kakao/callback"
            authorization-grant-type: authorization_code
            client-authentication-method: client_secret_post
            client-name: Kakao
            scope:
              - profile_nickname
              - account_email
        provider:
          kakao:
            authorization-uri: https://kauth.kakao.com/oauth/authorize
            token-uri: https://kauth.kakao.com/oauth/token
            user-info-uri: https://kapi.kakao.com/v2/user/me
            user-name-attribute: id
```

#### 3. 소셜 로그인 컨트롤러 구현
```java
@RestController
@RequestMapping("/api/auth")
public class SocialLoginController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final RestTemplate restTemplate;

    // 생성자 주입...

    @PostMapping("/social-login")
    public ResponseEntity<?> socialLogin(@RequestBody SocialLoginRequest request) {
        try {
            // 1. 소셜 인증 코드로 액세스 토큰 요청
            String accessToken = getSocialAccessToken(request.getProvider(), request.getCode());
            
            // 2. 액세스 토큰으로 사용자 정보 요청
            SocialUserInfo userInfo = getSocialUserInfo(request.getProvider(), accessToken);
            
            // 3. 사용자 정보로 회원가입 또는 로그인 처리
            User user = userService.findOrCreateSocialUser(userInfo);
            
            // 4. JWT 토큰 생성 및 반환
            String jwtToken = jwtTokenProvider.generateToken(user.getUsername());
            
            return ResponseEntity.ok(new LoginResponse(true, "소셜 로그인 성공", jwtToken, user.getUsername()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new LoginResponse(false, "소셜 로그인 처리 중 오류: " + e.getMessage(), null, null));
        }
    }
    
    // 소셜 액세스 토큰 요청 메소드
    private String getSocialAccessToken(String provider, String code) {
        // ... 구현
    }
    
    // 소셜 사용자 정보 요청 메소드
    private SocialUserInfo getSocialUserInfo(String provider, String accessToken) {
        // ... 구현
    }
}
```

#### 4. UserService에 소셜 로그인 관련 메소드 추가

```java
@Service
public class UserService {
    
    // ... 기존 코드
    
    @Transactional
    public User findOrCreateSocialUser(SocialUserInfo userInfo) {
        // 1. 소셜 ID로 사용자 조회
        Optional<User> existingUser = userRepository.findBySocialIdAndProvider(
            userInfo.getSocialId(), userInfo.getProvider());
            
        if (existingUser.isPresent()) {
            return existingUser.get();
        }
        
        // 2. 이메일로 사용자 조회 (이미 가입된 이메일인 경우 연동)
        if (userInfo.getEmail() != null) {
            Optional<User> userByEmail = userRepository.findByEmail(userInfo.getEmail());
            if (userByEmail.isPresent()) {
                User user = userByEmail.get();
                user.setSocialId(userInfo.getSocialId());
                user.setProvider(userInfo.getProvider());
                return userRepository.save(user);
            }
        }
        
        // 3. 새 사용자 생성
        User newUser = new User();
        newUser.setSocialId(userInfo.getSocialId());
        newUser.setProvider(userInfo.getProvider());
        newUser.setEmail(userInfo.getEmail());
        newUser.setUsername(generateUsername(userInfo));
        newUser.setNickname(userInfo.getNickname());
        newUser.setRole("ROLE_USER");
        
        // 소셜 로그인 사용자는 임의의 비밀번호 생성
        String randomPassword = UUID.randomUUID().toString();
        newUser.setPassword(passwordEncoder.encode(randomPassword));
        
        return userRepository.save(newUser);
    }
    
    private String generateUsername(SocialUserInfo userInfo) {
        // 소셜 로그인 시 사용자 이름 생성 로직
        String prefix = userInfo.getProvider().substring(0, 1).toUpperCase();
        return prefix + "_" + userInfo.getSocialId();
    }
}
```

#### 5. 사용자 테이블 수정
소셜 로그인 지원을 위해 사용자 테이블에 다음 필드를 추가해야 합니다:
- social_id: 소셜 로그인 서비스에서의 고유 ID
- provider: 소셜 로그인 제공자 (kakao, naver, google)

```sql
ALTER TABLE users ADD COLUMN social_id VARCHAR(255);
ALTER TABLE users ADD COLUMN provider VARCHAR(20);
```

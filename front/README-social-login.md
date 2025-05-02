# 소셜 로그인 구현 가이드

## 개요
이 문서는 React 프론트엔드와 Spring Boot 백엔드를 사용한 카카오 소셜 로그인 구현 방법을 설명합니다.

## 구현된 기능
- 카카오 로그인 버튼 표시
- 카카오 로그인 인증 처리
- 백엔드 API와 통신하여 소셜 로그인 완료

## 프론트엔드 구현 상세

### 1. 소셜 로그인 서비스 (`src/api/socialAuthService.ts`)
- 카카오 로그인 URL 생성 및 반환
- 인증 코드 처리 및 백엔드 API 호출
- 응답 처리 및 토큰 저장

### 2. 카카오 로그인 버튼 (`src/components/KakaoLoginButton.tsx`)
- 카카오 디자인 가이드라인에 맞는 버튼 UI
- 클릭 시 카카오 인증 페이지로 리다이렉트

### 3. 카카오 콜백 처리 (`src/pages/auth/KakaoCallback.tsx`)
- URL에서 인증 코드 추출
- 백엔드로 인증 코드 전송
- 로딩 및 에러 상태 처리
- 로그인 성공 시 메인 페이지로 리다이렉트

## 백엔드 구현 가이드

### 필요한 의존성
Spring Boot 프로젝트에 다음 의존성 추가:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

### 백엔드 흐름
1. 프론트엔드에서 인증 코드 수신
2. 인증 코드로 카카오 토큰 요청
3. 토큰으로 카카오 사용자 정보 요청
4. 사용자 정보로 DB 검색 또는 신규 회원 등록
5. JWT 토큰 생성 및 프론트엔드로 반환

### 카카오 API 응답 예시
```json
{
  "id": 123456789,
  "connected_at": "2023-05-31T00:00:00Z",
  "properties": {
    "nickname": "사용자",
    "profile_image": "http://k.kakaocdn.net/....",
    "thumbnail_image": "http://k.kakaocdn.net/...."
  },
  "kakao_account": {
    "profile_needs_agreement": false,
    "profile": {
      "nickname": "사용자",
      "thumbnail_image_url": "http://k.kakaocdn.net/....",
      "profile_image_url": "http://k.kakaocdn.net/....",
      "is_default_image": false
    },
    "email_needs_agreement": false,
    "email": "user@example.com"
  }
}
```

## 보안 고려사항
1. Client Secret은 환경 변수로 관리 (코드에 직접 넣지 않기)
2. 백엔드에서 CORS 설정 확인
3. 카카오 개발자 콘솔에서 허용된 리다이렉트 URI 설정 확인
4. 사용자 식별에 카카오 ID를 사용하여 이메일 중복 문제 방지
5. 소셜 로그인과 일반 로그인 계정 연동 처리 로직 구현

## 테스트 시나리오
1. 로그인 페이지에서 카카오 로그인 버튼 클릭
2. 카카오 로그인 페이지로 이동하여 로그인
3. 콜백 URL로 리다이렉트되며 인증 코드 수신
4. 백엔드 API 호출하여 로그인 완료
5. 로그인 후 상태 확인 (로컬 스토리지의 토큰 등)

## 추가 확장 계획
1. 네이버, 구글 소셜 로그인 추가
2. 소셜 계정 연동/해제 기능
3. 소셜 로그인 사용자 프로필 이미지 활용
4. 리프레시 토큰 구현으로 로그인 상태 유지 
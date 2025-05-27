# TDC 배포 가이드

## 1. 프론트엔드 배포 (GitHub Pages)

프론트엔드는 이미 GitHub Pages에 배포되었습니다.
URL: https://hyunki.github.io/TDC/

## 2. 백엔드 배포 (Render)

### 2.1. Render 계정 생성
1. [Render](https://render.com) 웹사이트에 접속하여 계정을 생성하세요.
2. 가입 후 로그인합니다.

### 2.2. 데이터베이스 생성
1. Render 대시보드에서 "New PostgreSQL" 버튼을 클릭합니다.
2. 다음 정보를 입력합니다:
   - Name: webchat-db (또는 원하는 이름)
   - Database: webchat
   - User: webchat_user
3. "Create Database" 버튼을 클릭합니다.
4. 데이터베이스 정보(Host, Port, Database, Username, Password)를 기록해 둡니다.

### 2.3. 웹 서비스 생성
1. Render 대시보드에서 "New Web Service" 버튼을 클릭합니다.
2. GitHub 또는 GitLab 계정을 연결하고 리포지토리를 선택합니다.
3. 다음 정보를 입력합니다:
   - Name: webchat-backend (또는 원하는 이름)
   - Root Directory: back
   - Runtime: Java
   - Build Command: `./mvnw clean package -DskipTests`
   - Start Command: `java -jar target/chat-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod`
4. "Environment Variables" 섹션에서 다음 환경 변수를 추가합니다:
   - `JDBC_DATABASE_URL`: PostgreSQL 연결 문자열 (jdbc:postgresql://host:port/database)
   - `JDBC_DATABASE_USERNAME`: PostgreSQL 사용자 이름
   - `JDBC_DATABASE_PASSWORD`: PostgreSQL 비밀번호
   - `JWT_SECRET`: JWT 서명에 사용할 비밀 키 (임의의 복잡한 문자열)
   - `APP_URL`: 배포된 백엔드 URL (https://webchat-backend.onrender.com 형식)
5. "Create Web Service" 버튼을 클릭합니다.

### 2.4. 프론트엔드 설정 업데이트
1. 백엔드가 배포된 후, 프론트엔드 코드에서 API URL을 업데이트합니다:
   ```typescript
   // src/api/apiClient.ts
   const BASE_URL = 'https://webchat-backend.onrender.com'; // 실제 백엔드 URL로 변경
   ```
2. 프론트엔드를 다시 빌드하고 배포합니다:
   ```bash
   cd front
   npm run deploy
   ```

## 3. 주의 사항

1. Render의 무료 플랜에서는 15분 동안 요청이 없으면 서비스가 자동으로 중지됩니다. 첫 요청 시 서비스가 다시 시작되기까지 약간의 지연이 발생할 수 있습니다.
2. 파일 업로드 기능은 Render의 임시 파일 시스템을 사용하므로, 서비스가 다시 시작되면 업로드된 파일이 사라집니다. 프로덕션 환경에서는 AWS S3와 같은 외부 스토리지 서비스를 사용하는 것이 좋습니다.
3. 소셜 로그인 설정 시 각 서비스(Google, Kakao, Naver)의 개발자 콘솔에서 리디렉션 URI를 배포된 프론트엔드 URL로 업데이트해야 합니다.

## 4. 연결 테스트

백엔드와 프론트엔드의 연결이 제대로 되었는지 확인하려면 다음 단계를 따릅니다:

1. 프론트엔드(GitHub Pages)에 접속합니다: https://hyunki.github.io/TDC/
2. 회원가입 또는 로그인을 시도합니다.
3. 개발자 도구(F12)를 열고 네트워크 탭을 확인합니다:
   - API 요청이 배포된 백엔드 URL로 향하는지 확인합니다.
   - 응답 상태를 확인합니다.
4. 콘솔 탭에서 에러 메시지가 있는지 확인합니다.

문제가 발생하는 경우:
1. CORS 설정이 올바른지 확인합니다.
2. 백엔드 로그를 확인합니다(Render 대시보드에서 확인 가능).
3. 환경 변수가 올바르게 설정되었는지 확인합니다.
4. 데이터베이스 연결이 정상적인지 확인합니다. 
/**
 * 소셜 로그인에서 받아온 사용자 정보
 */
export interface SocialUserInfo {
  /**
   * 소셜 서비스 제공자 (kakao, naver, google)
   */
  provider: 'kakao' | 'naver' | 'google';
  
  /**
   * 소셜 서비스에서의 고유 ID
   */
  socialId: string;
  
  /**
   * 사용자 이메일 (제공되는 경우)
   */
  email?: string;
  
  /**
   * 사용자 닉네임 (제공되는 경우)
   */
  nickname?: string;
  
  /**
   * 사용자 프로필 이미지 URL (제공되는 경우)
   */
  profileImage?: string;
  
  /**
   * 추가 정보 (플랫폼별 특수 필드)
   */
  additionalInfo?: Record<string, any>;
} 
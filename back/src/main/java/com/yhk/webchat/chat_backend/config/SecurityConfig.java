package com.yhk.webchat.chat_backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.yhk.webchat.chat_backend.security.JwtAuthenticationFilter;

import java.util.Arrays;

/**
 * 보안 설정 클래스
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * 비밀번호 인코더 빈 등록
     * @return BCryptPasswordEncoder 인스턴스
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    /**
     * 인증 관리자 빈 등록
     * @param authenticationConfiguration 인증 설정
     * @return AuthenticationManager 인스턴스
     * @throws Exception 인증 관리자 생성 중 발생할 수 있는 예외
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) 
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
    
    /**
     * CORS 설정
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:3001"
        ));  // 리액트 개발 서버
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);  // 인증 정보 필요
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    
    /**
     * 보안 필터 체인 설정
     * @param http HttpSecurity 객체
     * @return SecurityFilterChain 인스턴스
     * @throws Exception 보안 설정 중 발생할 수 있는 예외
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)  // CSRF 보호 비활성화 (API 서버용)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))  // CORS 설정 적용
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // 세션 사용 안함 (JWT 사용)
            .authorizeHttpRequests(authorize -> authorize
                // 공개 API 경로 설정
                .requestMatchers(HttpMethod.POST, "/api/auth/**").permitAll()  // 인증 관련 POST API는 모두 허용
                .requestMatchers(HttpMethod.GET, "/api/auth/**").permitAll()   // 인증 관련 GET API는 모두 허용
                .requestMatchers("/api/test/hello").permitAll()  // 헬로 테스트 API 허용
                .requestMatchers("/api/test/info").permitAll()   // 인포 테스트 API 허용
                .requestMatchers("/h2-console/**").permitAll()   // H2 콘솔 허용
                
                // 워크스페이스 관련 API는 인증 필요
                .requestMatchers("/api/workspaces/**").authenticated()
                
                // 그 외 모든 요청은 인증 필요
                .anyRequest().authenticated()
            )
            .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable()))  // H2 콘솔을 위한 프레임 옵션 비활성화
            .formLogin(AbstractHttpConfigurer::disable)  // 폼 로그인 비활성화
            .httpBasic(AbstractHttpConfigurer::disable);  // HTTP 기본 인증 비활성화
            
        // JWT 필터 추가
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }
} 
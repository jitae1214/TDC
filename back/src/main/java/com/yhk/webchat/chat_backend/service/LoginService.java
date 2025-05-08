package com.yhk.webchat.chat_backend.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yhk.webchat.chat_backend.dto.request.auth.LoginRequest;
import com.yhk.webchat.chat_backend.dto.response.auth.LoginResponse;
import com.yhk.webchat.chat_backend.model.User;
import com.yhk.webchat.chat_backend.repository.UserRepository;
import com.yhk.webchat.chat_backend.security.JwtTokenProvider;

/**
 * 로그인 관련 비즈니스 로직을 담당하는 서비스
 */
@Service
public class LoginService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    /**
     * 사용자 로그인 처리
     * @param loginRequest 로그인 요청 정보
     * @return 로그인 결과 정보
     */
    @Transactional
    public LoginResponse login(LoginRequest loginRequest) {
        try {
            // Spring Security를 통한 인증 처리
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
                )
            );
            
            // 인증 정보를 SecurityContext에 저장
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // 로그인 성공 시 사용자 정보 업데이트
            User user = userRepository.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
            
            // 마지막 로그인 시간 업데이트
            user.setLastLoginAt(LocalDateTime.now());
            
            // 사용자 상태 온라인으로 변경
            user.setStatus("ONLINE");
            userRepository.save(user);
            
            // JWT 토큰 생성
            String token = jwtTokenProvider.generateToken(user.getUsername());
            
            // 응답 생성
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("username", user.getUsername());
            userInfo.put("email", user.getEmail());
            userInfo.put("nickname", user.getNickname());
            userInfo.put("profileImageUrl", user.getProfileImageUrl());
            
            return new LoginResponse(true, token, userInfo, "로그인 성공", null);
        } catch (BadCredentialsException e) {
            return new LoginResponse(false, null, null, "아이디 또는 비밀번호가 일치하지 않습니다.", null);
        } catch (Exception e) {
            return new LoginResponse(false, null, null, "로그인 처리 중 오류가 발생했습니다.", e.getMessage());
        }
    }
    
    /**
     * JWT 토큰 검증
     * @param token JWT 토큰
     * @return 유효성 여부
     */
    public boolean validateToken(String token) {
        return jwtTokenProvider.validateToken(token);
    }
    
    /**
     * 토큰에서 사용자 이름 추출
     * @param token JWT 토큰
     * @return 사용자 이름
     */
    public String getUsernameFromToken(String token) {
        return jwtTokenProvider.getUsernameFromToken(token);
    }
} 
package com.yhk.webchat.chat_backend.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.yhk.webchat.chat_backend.dto.request.auth.LoginRequest;
import com.yhk.webchat.chat_backend.dto.response.auth.LoginResponse;
import com.yhk.webchat.chat_backend.model.User;
import com.yhk.webchat.chat_backend.repository.UserRepository;
import com.yhk.webchat.chat_backend.security.JwtTokenProvider;

/**
 * 로그인 처리를 위한 서비스
 */
@Service
public class LoginService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    /**
     * 로그인 처리
     * @param loginRequest 로그인 요청 정보
     * @return 로그인 결과
     */
    public LoginResponse login(LoginRequest loginRequest) {
        // 사용자 조회
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new BadCredentialsException("아이디 또는 비밀번호가 일치하지 않습니다."));
        
        // 비밀번호 검증
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("아이디 또는 비밀번호가 일치하지 않습니다.");
        }
        
        // 이메일 인증 여부 확인
        if (!user.isEmailVerified()) {
            return LoginResponse.fail("이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.");
        }
        
        // 마지막 로그인 시간 업데이트
        user.setLastLoginAt(LocalDateTime.now());
        // 상태 업데이트
        user.setStatus("ONLINE");
        userRepository.save(user);
        
        // JWT 토큰 생성
        String token = generateToken(user.getUsername());
        
        // 로그인 응답 생성
        return LoginResponse.success(
            user.getId(), 
            user.getUsername(), 
            user.getNickname(), 
            user.isEmailVerified(),
            token
        );
    }
    
    /**
     * 사용자 이름으로 JWT 토큰 생성
     * @param username 사용자 이름
     * @return JWT 토큰
     */
    public String generateToken(String username) {
        return jwtTokenProvider.generateToken(username);
    }
} 
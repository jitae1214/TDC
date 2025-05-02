package com.yhk.webchat.chat_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yhk.webchat.chat_backend.dto.request.auth.LoginRequest;
import com.yhk.webchat.chat_backend.dto.response.auth.LoginResponse;
import com.yhk.webchat.chat_backend.service.LoginService;

/**
 * 로그인 관련 컨트롤러
 */
@RestController
@RequestMapping("/api/auth")
public class LoginController {

    @Autowired
    private LoginService loginService;
    
    /**
     * 로그인 처리
     * @param loginRequest 로그인 요청 데이터
     * @return 로그인 결과
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse response = loginService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.ok(LoginResponse.fail("아이디 또는 비밀번호가 일치하지 않습니다."));
        } catch (Exception e) {
            return ResponseEntity.ok(LoginResponse.fail("로그인 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
} 
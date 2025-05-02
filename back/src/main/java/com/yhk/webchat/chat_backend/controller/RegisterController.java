package com.yhk.webchat.chat_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model; //이메일 인증 버튼 누른 다음 화면 표시
import org.springframework.web.bind.annotation.*;
import org.springframework.stereotype.Controller;

import com.yhk.webchat.chat_backend.service.RegisterService;
import com.yhk.webchat.chat_backend.dto.request.auth.RegisterRequest;
import com.yhk.webchat.chat_backend.dto.request.auth.UsernameAvailabilityRequest;
import com.yhk.webchat.chat_backend.dto.request.auth.EmailAvailabilityRequest;
import com.yhk.webchat.chat_backend.dto.request.auth.EmailVerificationRequest;
import com.yhk.webchat.chat_backend.dto.response.auth.RegisterResponse;
import com.yhk.webchat.chat_backend.dto.response.auth.UsernameAvailabilityResponse;
import com.yhk.webchat.chat_backend.dto.response.auth.EmailAvailabilityResponse;
import com.yhk.webchat.chat_backend.dto.response.auth.EmailVerificationResponse;

/**
 * 회원가입 관련 컨트롤러
 * 회원가입, 이메일 인증, 아이디/이메일 중복 확인 등의 기능 제공
 */
@Controller
@CrossOrigin(origins = "http://localhost:3000") // React 프론트엔드 서버 주소
public class RegisterController {

    @Autowired
    private RegisterService registerService;

    /**
     * 회원가입 처리
     * @param registerRequest 회원가입 정보(아이디, 비밀번호, 이메일 등)
     * @return 회원가입 결과
     */
    @PostMapping("/api/auth/register")
    @ResponseBody
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest registerRequest) {
        // 회원가입 서비스 호출
        RegisterResponse response = registerService.registerUser(registerRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * 이메일 인증 확인
     * @param token 인증 토큰
     * @return 인증 결과 페이지
     */
    @GetMapping("/verify")
    public String verifyEmail(@RequestParam String token, Model model) {
        // 이메일 인증 서비스 호출
        EmailVerificationResponse response = registerService.verifyEmail(token);
        
        // 모델에 이메일 및 메시지 추가
        model.addAttribute("email", response.getEmail());
        model.addAttribute("message", response.getMessage());
        
        // 인증 성공/실패에 따라 다른 페이지 반환
        if (response.isSuccess()) {
            return "email/verification-success";
        } else {
            return "email/verification-failure";
        }
    }

    /**
     * 이메일 인증 요청 (재전송 등)
     * @param request 이메일 인증 요청 정보
     * @return 인증 메일 발송 결과
     */
    @PostMapping("/api/auth/verify")
    @ResponseBody
    public ResponseEntity<EmailVerificationResponse> resendVerificationEmail(@RequestBody EmailVerificationRequest request) {
        // 이메일 인증 요청 서비스 호출
        EmailVerificationResponse response = registerService.resendVerificationEmail(request);
        return ResponseEntity.ok(response);
    }

    /**
     * 아이디 중복 확인
     * @param request 확인할 아이디 정보
     * @return 중복 여부
     */
    @PostMapping("/api/auth/check-username")
    @ResponseBody
    public ResponseEntity<UsernameAvailabilityResponse> checkUsernameAvailability(@RequestBody UsernameAvailabilityRequest request) {
        // 아이디 중복 확인 서비스 호출
        UsernameAvailabilityResponse response = registerService.checkUsernameAvailability(request.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * 이메일 중복 확인
     * @param request 확인할 이메일 정보
     * @return 중복 여부
     */
    @PostMapping("/api/auth/check-email")
    @ResponseBody
    public ResponseEntity<EmailAvailabilityResponse> checkEmailAvailability(@RequestBody EmailAvailabilityRequest request) {
        // 이메일 중복 확인 서비스 호출
        EmailAvailabilityResponse response = registerService.checkEmailAvailability(request.getEmail());
        return ResponseEntity.ok(response);
    }
}
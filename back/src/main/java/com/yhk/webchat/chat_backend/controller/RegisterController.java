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
import com.yhk.webchat.chat_backend.dto.response.ApiResponse;
import com.yhk.webchat.chat_backend.dto.response.auth.RegisterResponse;
import com.yhk.webchat.chat_backend.dto.response.auth.UsernameAvailabilityResponse;
import com.yhk.webchat.chat_backend.dto.response.auth.EmailAvailabilityResponse;
import com.yhk.webchat.chat_backend.dto.response.auth.EmailVerificationResponse;

/**
 * 회원가입 관련 컨트롤러
 * 회원가입, 이메일 인증, 아이디/이메일 중복 확인 등의 기능 제공
 * 참고: 일부 기능은 AuthController로 이전되었습니다.
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
    @PostMapping("/api/register/signup")
    @ResponseBody
    public ResponseEntity<ApiResponse> register(@RequestBody RegisterRequest registerRequest) {
        // 회원가입 서비스 호출
        ApiResponse response = registerService.register(registerRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * 이메일 인증 확인 (구 방식 - 레거시 호환용)
     * @param token 인증 토큰
     * @return 인증 결과 페이지
     */
    @GetMapping("/verify")
    public String verifyEmail(@RequestParam String token, Model model) {
        // 이제 토큰 기반 검증 메소드가 없으므로, 임시 데이터 설정
        model.addAttribute("email", "사용자 이메일");
        model.addAttribute("message", "최신 버전의 앱을 사용하여 이메일 인증을 진행해주세요.");
        
        // 인증 페이지로 이동
        return "email/verification-failure";
    }

    /**
     * 이메일 인증 처리 (인증 코드 방식)
     * 참고: AuthController로 기능이 이전되어 비활성화됨
     * @param request 이메일과 인증 코드
     * @return 인증 결과
     */
    /* 
    @PostMapping("/api/auth/verify-code")
    @ResponseBody
    public ResponseEntity<ApiResponse> verifyEmailCode(@RequestBody EmailVerificationRequest request) {
        // 인증 코드 검증 서비스 호출
        ApiResponse response = registerService.verifyCode(request.getEmail(), request.getVerificationCode());
        return ResponseEntity.ok(response);
    }
    */

    /**
     * 이메일 인증 요청 (재전송 등)
     * @param request 이메일 인증 요청 정보
     * @return 인증 메일 발송 결과
     */
    @PostMapping("/api/register/resend-verification")
    @ResponseBody
    public ResponseEntity<ApiResponse> resendVerificationEmail(@RequestBody EmailVerificationRequest request) {
        // 이메일 인증 요청 서비스 호출
        ApiResponse response = registerService.sendVerificationCode(request.getEmail());
        return ResponseEntity.ok(response);
    }

    /**
     * 아이디 중복 확인
     * @param request 확인할 아이디 정보
     * @return 중복 여부
     */
    @PostMapping("/api/register/check-username")
    @ResponseBody
    public ResponseEntity<UsernameAvailabilityResponse> checkUsername(@RequestBody UsernameAvailabilityRequest request) {
        // 아이디 중복 확인 서비스 호출
        UsernameAvailabilityResponse response = registerService.checkUsernameAvailability(request.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * 이메일 중복 확인
     * @param request 확인할 이메일 정보
     * @return 중복 여부
     */
    @PostMapping("/api/register/check-email")
    @ResponseBody
    public ResponseEntity<EmailAvailabilityResponse> checkEmail(@RequestBody EmailAvailabilityRequest request) {
        // 이메일 중복 확인 서비스 호출
        EmailAvailabilityResponse response = registerService.checkEmailAvailability(request.getEmail());
        return ResponseEntity.ok(response);
    }
}
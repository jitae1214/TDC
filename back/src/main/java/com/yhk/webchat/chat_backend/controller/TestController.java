package com.yhk.webchat.chat_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/hello")
    public ResponseEntity<Map<String, String>> hello() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "백엔드 시발롬아");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> info() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "running");
        response.put("version", "1.0.0");
        response.put("serverTime", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/protected")
    public ResponseEntity<Map<String, String>> protectedResource() {
        // 이 엔드포인트는 JWT 인증 후에만 접근 가능하도록 설정할 수 있습니다
        Map<String, String> response = new HashMap<>();
        response.put("message", "뭘 쳐보노 JWT아직 기능 구현 덜 됐다.");
        return ResponseEntity.ok(response);
    }
} 
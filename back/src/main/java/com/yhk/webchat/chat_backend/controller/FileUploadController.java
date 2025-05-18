package com.yhk.webchat.chat_backend.controller;

import com.yhk.webchat.chat_backend.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    @Autowired
    private FileStorageService fileStorageService;

    /**
     * 프로필 이미지 업로드 API
     * @param file 업로드할 이미지 파일
     * @return 저장된 이미지 경로
     */
    @PostMapping("/upload/profile")
    public ResponseEntity<?> uploadProfileImage(@RequestParam("file") MultipartFile file) {
        try {
            String fileUrl = fileStorageService.storeFile(file, "profiles");
            
            Map<String, String> response = new HashMap<>();
            response.put("fileUrl", fileUrl);
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * 워크스페이스 이미지 업로드 API
     * @param file 업로드할 이미지 파일
     * @return 저장된 이미지 경로
     */
    @PostMapping("/upload/workspace")
    public ResponseEntity<?> uploadWorkspaceImage(@RequestParam("file") MultipartFile file) {
        try {
            String fileUrl = fileStorageService.storeFile(file, "workspaces");
            
            Map<String, String> response = new HashMap<>();
            response.put("fileUrl", fileUrl);
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
} 
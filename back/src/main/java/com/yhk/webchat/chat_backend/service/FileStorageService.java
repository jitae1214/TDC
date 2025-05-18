package com.yhk.webchat.chat_backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    // 애플리케이션 속성에서 업로드 디렉터리 경로 가져옴
    @Value("${file.upload.dir:${user.home}/uploads}")
    private String uploadDir;

    /**
     * 이미지 파일을 저장하고 저장 경로를 반환
     *
     * @param file 업로드된 MultipartFile
     * @param subdirectory 저장할 하위 디렉터리 (예: "profiles", "workspaces")
     * @return 저장된 파일의 경로 (URL 접근 가능한 상대 경로)
     * @throws IOException 파일 저장 중 오류 발생 시
     */
    public String storeFile(MultipartFile file, String subdirectory) throws IOException {
        // 파일이 비어있는지 확인
        if (file.isEmpty()) {
            throw new IOException("저장할 파일이 비어있습니다");
        }

        // 파일 확장자 체크
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IOException("이미지 파일만 업로드 가능합니다");
        }

        // 원본 파일명에서 확장자 추출
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = "";
        if (originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        // 파일명 충돌 방지를 위해 UUID 사용
        String filename = UUID.randomUUID().toString() + fileExtension;
        
        // 지정된 하위 디렉터리 경로 생성
        String targetSubDir = subdirectory != null ? subdirectory : "";
        Path targetLocation = Paths.get(uploadDir, targetSubDir).toAbsolutePath().normalize();
        
        // 디렉터리가 없으면 생성
        Files.createDirectories(targetLocation);
        
        // 파일 저장
        Path targetPath = targetLocation.resolve(filename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        
        // 정적 리소스 접근 가능한 경로 반환 (URL)
        return "/uploads/" + (subdirectory != null ? subdirectory + "/" : "") + filename;
    }
} 
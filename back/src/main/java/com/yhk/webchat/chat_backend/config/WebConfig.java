package com.yhk.webchat.chat_backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 웹 설정 클래스
 * CORS 및 기타 웹 관련 설정을 처리
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Value("${file.upload.dir:${user.home}/uploads}")
    private String uploadDir;
    
    /**
     * CORS 설정
     * 개발 환경에서 여러 출처(포트)에서의 요청을 허용
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 전체 경로 허용
                .allowedOrigins("http://localhost:3000", "http://localhost:3001")  // 리액트 개발 서버
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // uc5c5ub85cub4dc ub514ub809ud130ub9acub97c uc815uc801 ub9acuc18cuc2a4ub85c uc81cuacf5
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        
        // ud30cuc77c uc2dcuc2a4ud15c uacbdub85cub85c uc811uadfcud558ub3c4ub85d uc124uc815
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadPath.toString() + "/");
                
        System.out.println("Resource location set to: file:" + uploadPath.toString() + "/");
    }
} 
package com.yhk.webchat.chat_backend.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * 이메일 발송 관련 서비스
 * 인증 메일, 알림 메일 등의 발송 기능 제공
 */
@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private TemplateEngine templateEngine;
    
    /**
     * 이메일 인증 메일 발송 (인증 코드 방식)
     * @param to 수신자 이메일
     * @param subject 메일 제목
     * @param verificationCode 인증 코드
     * @param username 사용자 아이디
     * @param fullName 사용자 이름
     * @throws MessagingException
     */
    public void sendVerificationEmail(String to, String subject, String verificationCode, String username, String fullName) throws MessagingException {
        System.out.println("이메일 인증 메일 발송: " + to + ", 인증 코드: " + verificationCode);
        
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        // 템플릿 컨텍스트 설정
        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("fullName", fullName);
        context.setVariable("verificationCode", verificationCode);
        
        // 템플릿 처리
        String emailContent = templateEngine.process("email/verification-code", context);
        
        // 메일 설정 및 발송
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(emailContent, true);
        
        mailSender.send(message);
        System.out.println("인증 코드 메일이 성공적으로 발송되었습니다: " + to);
    }
    
    /**
     * 이메일 인증 메일 발송 (이전 버전과의 호환성 유지)
     */
    public void sendVerificationEmail(String to, String subject, String verificationInfo, String username) throws MessagingException {
        sendVerificationEmail(to, subject, verificationInfo, username, username);
    }
    
    /**
     * 비밀번호 재설정 메일 발송
     * @param to 수신자 이메일
     * @param subject 메일 제목
     * @param resetUrl 비밀번호 재설정 URL
     * @param username 사용자 아이디
     * @param fullName 사용자 이름
     * @throws MessagingException
     */
    public void sendPasswordResetEmail(String to, String subject, String resetUrl, String username, String fullName) throws MessagingException {
        System.out.println("비밀번호 재설정 메일 발송: " + to + ", 재설정 URL: " + resetUrl);
        
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        // 템플릿 컨텍스트 설정
        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("fullName", fullName);
        context.setVariable("resetUrl", resetUrl);
        
        // 템플릿 처리
        String emailContent = templateEngine.process("email/password-reset", context);
        
        // 메일 설정 및 발송
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(emailContent, true);
        
        mailSender.send(message);
        System.out.println("비밀번호 재설정 메일이 성공적으로 발송되었습니다: " + to);
    }
    
    /**
     * 비밀번호 재설정 메일 발송 (이전 버전과의 호환성 유지)
     */
    public void sendPasswordResetEmail(String to, String subject, String resetUrl, String username) throws MessagingException {
        sendPasswordResetEmail(to, subject, resetUrl, username, username);
    }
} 
package com.yhk.webchat.chat_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.beans.factory.annotation.Autowired;

import com.yhk.webchat.chat_backend.security.StompAuthChannelInterceptor;

/**
 * WebSocket 설정 클래스
 * STOMP 메시지 브로커를 활성화하고 엔드포인트 설정
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired
    private StompAuthChannelInterceptor stompAuthChannelInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 메시지 브로커 설정
        // 클라이언트가 구독할 주제 접두사 설정
        registry.enableSimpleBroker("/topic", "/queue");
        
        // 클라이언트에서 서버로 메시지를 보낼 때 사용할 접두사
        registry.setApplicationDestinationPrefixes("/app");
        
        // 사용자 개인에게 보내는 메시지 접두사 설정
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 웹소켓 연결 엔드포인트 설정
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:3000", "http://localhost:3001")
                .withSockJS(); // SockJS 지원 활성화
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // 인증 인터셉터 등록 - 메시지 전송 시 인증 처리
        registration.interceptors(stompAuthChannelInterceptor);
    }
} 
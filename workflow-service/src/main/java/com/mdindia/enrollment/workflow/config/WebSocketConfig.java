package com.mdindia.enrollment.workflow.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private static final Logger log = LoggerFactory.getLogger(WebSocketConfig.class);
    private final NotificationHandler notificationHandler = new NotificationHandler();

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(notificationHandler, "/ws/notifications")
                .setAllowedOriginPatterns("*");
    }

    public NotificationHandler getNotificationHandler() {
        return notificationHandler;
    }

    public static class NotificationHandler extends TextWebSocketHandler {
        private final Set<WebSocketSession> sessions = new CopyOnWriteArraySet<>();

        @Override
        public void afterConnectionEstablished(WebSocketSession session) {
            sessions.add(session);
            log.info("[WebSocket] New client connected: id={}, totalSessions={}", session.getId(), sessions.size());
            
            // Send initial connection welcome banner
            try {
                String welcome = """
                    {"title":"WebSocket Connected","message":"Connected to MD India Real-Time Workflow Gateway","type":"SUCCESS","category":"SYSTEM"}
                    """;
                session.sendMessage(new TextMessage(welcome.trim()));
            } catch (IOException e) {
                log.error("Failed to send welcome message to session {}", session.getId(), e);
            }
        }

        @Override
        protected void handleTextMessage(WebSocketSession session, TextMessage message) {
            log.info("[WebSocket] Broadcast message from session {}: {}", session.getId(), message.getPayload());
            // Broadcast incoming notification to all connected sessions
            broadcast(message.getPayload());
        }

        @Override
        public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
            sessions.remove(session);
            log.info("[WebSocket] Client disconnected: id={}, remainingSessions={}", session.getId(), sessions.size());
        }

        public void broadcast(String jsonPayload) {
            for (WebSocketSession session : sessions) {
                if (session.isOpen()) {
                    try {
                        synchronized (session) { // sessions are not safe for concurrent sends
                            session.sendMessage(new TextMessage(jsonPayload));
                        }
                    } catch (IOException e) {
                        log.error("Failed to broadcast to session {}", session.getId(), e);
                    }
                }
            }
        }
    }
}

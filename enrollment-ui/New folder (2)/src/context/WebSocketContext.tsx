import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { NotificationEvent } from '../types';

interface WebSocketContextType {
  isConnected: boolean;
  notifications: NotificationEvent[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  broadcastNotification: (notification: Omit<NotificationEvent, 'id' | 'timestamp' | 'read'>) => void;
  activeToast: NotificationEvent | null;
  dismissToast: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

const DEFAULT_NOTIFICATIONS: NotificationEvent[] = [
  {
    id: 'notif-1',
    title: 'New Inward Received',
    message: 'INW-2026-1001 for Tata Consultancy Services uploaded with 5,000 members.',
    type: 'INFO',
    timestamp: '10 mins ago',
    read: false,
    category: 'WORKFLOW'
  },
  {
    id: 'notif-2',
    title: 'QC Review Pending',
    message: 'Processor Rahul has submitted policy draft POL-TCS-2026-001 for Maker-Checker signoff.',
    type: 'WARNING',
    timestamp: '5 mins ago',
    read: false,
    category: 'POLICY'
  }
];

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationEvent[]>(DEFAULT_NOTIFICATIONS);
  const [activeToast, setActiveToast] = useState<NotificationEvent | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  const triggerToast = useCallback((notif: NotificationEvent) => {
    setActiveToast(notif);
    setTimeout(() => {
      setActiveToast((current) => (current?.id === notif.id ? null : current));
    }, 5000);
  }, []);

  const handleIncomingMessage = useCallback((event: MessageEvent) => {
    try {
      const parsed = JSON.parse(event.data);
      const newNotif: NotificationEvent = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: parsed.title || 'System Notification',
        message: parsed.message || parsed.content || JSON.stringify(parsed),
        type: parsed.type || 'INFO',
        timestamp: 'Just now',
        read: false,
        category: parsed.category || 'SYSTEM',
        relatedId: parsed.relatedId
      };
      setNotifications(prev => [newNotif, ...prev]);
      triggerToast(newNotif);
    } catch (e) {
      console.warn('Non-JSON WebSocket payload received:', event.data);
    }
  }, [triggerToast]);

  const connectWebSocket = useCallback(() => {
    const wsUrls = [
      'ws://localhost:8084/ws/notifications',
      `ws://${window.location.hostname}:8084/ws/notifications`,
      `ws://${window.location.host}/ws/notifications`
    ];

    const currentUrl = wsUrls[0];
    
    try {
      const ws = new WebSocket(currentUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log('[WebSocket] Connected to MD India Notification Gateway');
      };

      ws.onmessage = handleIncomingMessage;

      ws.onerror = () => {
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt reconnection after 8 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 8000);
      };
    } catch (err) {
      setIsConnected(false);
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 10000);
    }
  }, [handleIncomingMessage]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

  const broadcastNotification = useCallback((data: Omit<NotificationEvent, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationEvent = {
      ...data,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      read: false
    };

    // If live WebSocket is connected and open, send to server
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        socketRef.current.send(JSON.stringify(newNotif));
      } catch (e) {
        console.error('Failed to send message over WebSocket', e);
      }
    }

    // Always update local UI state immediately for responsive feedback
    setNotifications(prev => [newNotif, ...prev]);
    triggerToast(newNotif);
  }, [triggerToast]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        broadcastNotification,
        activeToast,
        dismissToast
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

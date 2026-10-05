import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AppNotification,
  ConnectionStatus,
  NotificationContext,
  NotificationListener,
  StoredNotification,
} from "./context";

const RECONNECT_BASE_MS = 1_000;
const RECONNECT_MAX_MS = 30_000;
const MAX_HISTORY = 50;

/**
 * VITE_WS_NOTIFICATIONS_URL overrides the address. By default the socket is opened on the
 * page's own origin; in development Vite proxies /ws to workflow-service.
 */
function resolveSocketUrl(): string {
  const configured = import.meta.env.VITE_WS_NOTIFICATIONS_URL as string | undefined;
  if (configured) return configured;
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws/notifications`;
}

function showToast(notification: AppNotification) {
  const title = notification.title || notification.message;
  if (!title) return;
  const options = {
    id: notification.id,
    description: notification.title ? notification.message : undefined,
    position: "top-right" as const,
    duration: 5000,
  };
  switch (notification.type) {
    case "SUCCESS":
      toast.success(title, options);
      break;
    case "WARNING":
      toast.warning(title, options);
      break;
    case "ERROR":
      toast.error(title, options);
      break;
    default:
      toast.info(title, options);
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [history, setHistory] = useState<StoredNotification[]>([]);
  const listenersRef = useRef(new Map<string, Set<NotificationListener>>());
  const sequenceRef = useRef(0);

  const markAllRead = useCallback(
    () => setHistory((items) => (items.some((n) => !n.read) ? items.map((n) => ({ ...n, read: true })) : items)),
    [],
  );
  const remove = useCallback((key: string) => setHistory((items) => items.filter((n) => n.key !== key)), []);
  const clear = useCallback(() => setHistory([]), []);

  const subscribe = useCallback((category: string, listener: NotificationListener) => {
    const listeners = listenersRef.current;
    if (!listeners.has(category)) listeners.set(category, new Set());
    listeners.get(category)!.add(listener);
    return () => {
      listeners.get(category)?.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (import.meta.env.VITE_ENABLE_NOTIFICATIONS === "false") {
      setStatus("closed");
      return;
    }

    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;
    let disposed = false;

    const dispatch = (notification: AppNotification) => {
      const listeners = listenersRef.current;
      for (const key of [notification.category, "*"]) {
        listeners.get(key)?.forEach((listener) => {
          try {
            listener(notification);
          } catch (error) {
            console.error("[Notifications] Listener failed:", error);
          }
        });
      }
    };

    const connect = () => {
      if (disposed) return;
      setStatus("connecting");
      socket = new WebSocket(resolveSocketUrl());

      socket.onopen = () => {
        attempt = 0;
        setStatus("open");
      };

      socket.onmessage = (event) => {
        let notification: AppNotification;
        try {
          notification = JSON.parse(event.data);
        } catch {
          console.warn("[Notifications] Ignoring non-JSON message:", event.data);
          return;
        }
        if (!notification || typeof notification.category !== "string") return;

        // The connect banner arrives on every (re)connect; keep it out of the toasts and bell.
        if (notification.category !== "SYSTEM") {
          showToast(notification);
          sequenceRef.current += 1;
          const stored: StoredNotification = {
            ...notification,
            key: `${Date.now()}-${sequenceRef.current}`,
            receivedAt: Date.now(),
            read: false,
          };
          setHistory((items) => [stored, ...items].slice(0, MAX_HISTORY));
        }
        dispatch(notification);
      };

      socket.onclose = () => {
        socket = null;
        if (disposed) return;
        setStatus("closed");
        const delay = Math.min(RECONNECT_BASE_MS * 2 ** attempt, RECONNECT_MAX_MS);
        attempt += 1;
        reconnectTimer = setTimeout(connect, delay);
      };

      // An error is always followed by close, which schedules the reconnect.
      socket.onerror = () => socket?.close();
    };

    connect();

    return () => {
      disposed = true;
      clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, []);

  const unreadCount = useMemo(() => history.filter((n) => !n.read).length, [history]);

  const value = useMemo(
    () => ({ status, subscribe, history, unreadCount, markAllRead, remove, clear }),
    [status, subscribe, history, unreadCount, markAllRead, remove, clear],
  );

  return <NotificationContext value={value}>{children}</NotificationContext>;
}

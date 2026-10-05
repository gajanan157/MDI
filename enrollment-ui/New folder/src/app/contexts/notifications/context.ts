import { useEffect, useRef } from "react";
import { createSafeContext } from "@/utils/createSafeContext";

export type NotificationType = "SUCCESS" | "INFO" | "WARNING" | "ERROR";

/** Message shape sent by workflow-service on /ws/notifications. */
export interface AppNotification {
  id?: string;
  title?: string;
  message?: string;
  type?: NotificationType;
  /** e.g. "SYSTEM", "WORK_ITEM_ASSIGNED" */
  category: string;
  data?: Record<string, any>;
}

export type ConnectionStatus = "connecting" | "open" | "closed";

export type NotificationListener = (notification: AppNotification) => void;

/** A received notification kept for the header bell. */
export interface StoredNotification extends AppNotification {
  /** Unique per received message (AppNotification.id can repeat). */
  key: string;
  receivedAt: number;
  read: boolean;
}

export interface NotificationContextType {
  status: ConnectionStatus;
  /** Newest first; kept in memory for this browser tab only. */
  history: StoredNotification[];
  unreadCount: number;
  markAllRead: () => void;
  remove: (key: string) => void;
  clear: () => void;
  /** Registers a listener for one category ("*" for all). Returns an unsubscribe function. */
  subscribe: (category: string, listener: NotificationListener) => () => void;
}

export const [NotificationContext, useNotificationContext] =
  createSafeContext<NotificationContextType>(
    "useNotificationContext must be used within NotificationProvider",
  );

/**
 * Runs `handler` for every notification of `category` while the component is mounted.
 * The latest handler is always used, so it does not need to be memoized.
 */
export function useNotificationListener(category: string, handler: NotificationListener) {
  const { subscribe } = useNotificationContext();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(
    () => subscribe(category, (notification) => handlerRef.current(notification)),
    [category, subscribe],
  );
}

// src/app/contexts/keycloak/KeycloakProvider.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  type RefObject,
  ReactNode,
} from "react";
import keycloak from "@/keycloak";
import { getUserPermissions } from "@/app/auth/permissions";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setSelectedRoles } from "@/store/features/tpa/tpaSlice";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { isKeycloakEnabled } from "@/utils/mockAuth";
import {
  activeRoleFromToken,
  clearStoredToken,
  fetchCurrentUser,
  getStoredToken,
  isTokenExpired,
  isTokenStorageEvent,
  LocalAuthError,
  loginWithPassword as requestLocalLogin,
  notifyLogout,
  storeToken,
  userInfoFromToken,
} from "@/utils/localAuth";
import { LocalLoginPage } from "./LocalLoginPage";

type KeycloakContextType = {
  keycloak: typeof keycloak | null;
  initialized: boolean;
  authenticated: boolean;
  userInfo: any | null;
  token: string | null;
  login: () => void;
  /** Local login only (Keycloak disabled). Reloads into the app on success; throws on failure. */
  loginWithPassword: (username: string, password: string) => Promise<void>;
  logout: (redirectUri?: string) => void;
  updateToken: (minValidity?: number) => Promise<boolean>;
  ensureValidToken: (minValidity?: number) => Promise<string | null>;
  getRemainingSeconds?: () => { access: number; refresh: number };
};

const KeycloakContext = createContext<KeycloakContextType | undefined>(
  undefined,
);

// Global token accessor (useful for non-react code)
let currentToken: string | null = null;
export const getKeycloakToken = () => currentToken;


const nowSecKeycloak = () => Math.ceil(Date.now() / 1000);
const getTimeSkewSec = (kc: any): number =>
  typeof kc?.timeSkew === "number" ? kc.timeSkew : 0;

const getAccessExpirySec = (kc: any) => kc?.tokenParsed?.exp ?? 0;
const getAccessIssuedAtSec = (kc: any) => kc?.tokenParsed?.iat ?? 0;
const getRefreshExpirySec = (kc: any) => kc?.refreshTokenParsed?.exp ?? 0;

const secsUntilAccessExpiry = (kc: any) => {
  const exp = getAccessExpirySec(kc);
  if (!exp) return 0;
  const skew = getTimeSkewSec(kc);
  return Math.max(0, exp - nowSecKeycloak() + skew);
};
const secsUntilRefreshExpiry = (kc: any) => {
  const exp = getRefreshExpirySec(kc);
  if (!exp) return 0;
  const skew = getTimeSkewSec(kc);
  return Math.max(0, exp - nowSecKeycloak() + skew);
};
const accessLifetimeSec = (kc: any) => {
  const iat = getAccessIssuedAtSec(kc);
  const exp = getAccessExpirySec(kc);
  if (!iat || !exp) return 0;
  return Math.max(0, exp - iat);
};

/** Same limit as inactivity guards in tryRefreshIfNeeded / interval */
const KC_INACTIVITY_MS = 5 * 60 * 1000;

/* ------------------------------
    Small async wait helper
------------------------------- */
const waitForUpdatingClear = (
  updatingRef: RefObject<boolean>,
  timeoutMs = 2000,
) =>
  new Promise<void>((resolve) => {
    if (!updatingRef.current) return resolve();
    const start = Date.now();
    const tick = () => {
      if (!updatingRef.current) return resolve();
      if (Date.now() - start >= timeoutMs) return resolve();
      setTimeout(tick, 50);
    };
    setTimeout(tick, 50);
  });


const BC_NAME = "kc-activity";

const tryCreateBroadcast = () => {
  try {
    if (typeof BroadcastChannel === "undefined") {
      console.warn("BroadcastChannel not available — cross-tab sync disabled.");
      return null;
    }
    return new BroadcastChannel(BC_NAME);
  } catch (err) {
    console.warn(
      "Failed creating BroadcastChannel — cross-tab sync disabled.",
      err,
    );
    return null;
  }
};

export const KeycloakProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [kcInstance, setKcInstance] = useState<typeof keycloak | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // refs
  const kcRef = useRef<any>(null);
  const lastActivityRef = useRef<number>(Date.now()); // timestamp of latest activity (across tabs when BC available)
  const refreshIntervalRef = useRef<number | null>(null);
  const loginTriggeredRef = useRef<boolean>(false);
  const updatingRef = useRef<boolean>(false); // prevents concurrent updateToken calls
  const bcRef = useRef<BroadcastChannel | null>(null);
  /** Single place for local logout cleanup + notifying other tabs */
  const forceLogout = async () => {
    // Clear interval to prevent repeated logout attempts
    if (refreshIntervalRef.current) {
      window.clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    try {
      await kcRef.current?.logout({ redirectUri: window.location.origin });
    } catch {
      /* ignore */
    }
    setToken(null);
    currentToken = null;
    setAuthenticated(false);
    setUserInfo(null);
    // Reset login trigger so login can happen again if needed
    loginTriggeredRef.current = false;
    try {
      const bc = bcRef.current;
      if (bc) bc.postMessage({ type: "logout", ts: Date.now() });
    } catch {
      /* ignore */
    }
  };

  /* ------------------------------
      Helper: decide & perform refresh when active
      - Called from interval and from activity events
  ------------------------------- */
  const tryRefreshIfNeeded = async () => {
    const kcNow = kcRef.current;
    if (!kcNow) return;
    /**
     * Without a real session, expiry helpers are 0 → old code called logout on every
     * mousemove/click ("login page" ↔ "logout page" loop in PWA).
     */
    if (!kcNow.authenticated || !kcNow.token) return;

    const accessLeft = secsUntilAccessExpiry(kcNow);
    const refreshLeft = secsUntilRefreshExpiry(kcNow);
    const inactiveMs = Date.now() - lastActivityRef.current;

    // no recent activity across tabs -> logout
    if (inactiveMs > KC_INACTIVITY_MS) {
      await forceLogout();
      return;
    }

    // if both expired -> logout
    if (accessLeft <= 0 && refreshLeft <= 0) {
      await forceLogout();
      return;
    }

    // compute refresh threshold
    const ABSOLUTE_THRESHOLD_SEC = 60; // refresh if <= 60s remaining
    const LIFETIME_FRACTION = 0.2; // refresh when <= 20% of token lifetime remaining
    const lifetime = accessLifetimeSec(kcNow);
    const fractionalThreshold = lifetime
      ? Math.floor(lifetime * LIFETIME_FRACTION)
      : 0;
    const SHOULD_REFRESH_SECONDS = Math.max(
      ABSOLUTE_THRESHOLD_SEC,
      fractionalThreshold,
    );

    if (accessLeft <= SHOULD_REFRESH_SECONDS) {
      if (updatingRef.current) return;
      updatingRef.current = true;
      try {
        await kcNow.updateToken(SHOULD_REFRESH_SECONDS);
        setToken(kcNow.token ?? null);
        currentToken = kcNow.token ?? null;

        // broadcast new token to other tabs
        try {
          const bc = bcRef.current;
          if (bc)
            bc.postMessage({
              type: "token",
              token: kcNow.token ?? null,
              ts: Date.now(),
            });
        } catch {
          /* ignore */
        }

        // token missing -> logout
        if (!kcNow.token) await forceLogout();
      } catch (err) {
        console.warn("Automatic refresh failed", err);

        // Only logout if refresh token also expired, otherwise don't clear session
        if (secsUntilRefreshExpiry(kcNow) <= 0) await forceLogout();
      } finally {
        updatingRef.current = false;
      }
    }
  };

  /* ------------------------------
      Setup BroadcastChannel (only)
  ------------------------------- */
  useEffect(() => {
    if (!isKeycloakEnabled()) return;
    bcRef.current = tryCreateBroadcast();

    const bc = bcRef.current;
    if (!bc) return;
    const onMessage = (ev: MessageEvent) => {
      const data = ev.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "activity" && typeof data.ts === "number") {
        lastActivityRef.current = data.ts;
      } else if (data.type === "token") {
        const newToken = data.token ?? null;
        if (newToken) {
          setToken(newToken);

          currentToken = newToken;
          if (kcRef.current) {
            try {
              kcRef.current.token = newToken;
            } catch {
              // ignore
            }
          }
        } else {
          setToken(null);
          currentToken = null;
        }
      } else if (data.type === "logout") {
        // remote tab forced a logout
        setToken(null);
        currentToken = null;
        setAuthenticated(false);
        setUserInfo(null);
        // reload so login-required init redirects to the login page (otherwise stuck on "Redirecting...")
        window.location.reload();
      }
    };

    bc.addEventListener("message", onMessage);

    return () => {
      try {
        bc.removeEventListener("message", onMessage);
        bc.close();
      } catch {
        /* ignore */
      }
    };
  }, []);


  useEffect(() => {
    if (!isKeycloakEnabled()) return;
    const events = ["mousemove", "keydown", "scroll", "touchstart", "click"];
    const ACTIVITY_THROTTLE_MS = 5_000; // mousemove/scroll fire very often
    let lastHandledAt = 0;
    const updateActivity = async () => {
      const ts = Date.now();
      lastActivityRef.current = ts;
      if (ts - lastHandledAt < ACTIVITY_THROTTLE_MS) return;
      lastHandledAt = ts;
      try {
        const bc = bcRef.current;
        if (bc) {
          bc.postMessage({ type: "activity", ts });
        }
      } catch {
        // ignore
      }
      // run immediate refresh check (so active user triggers refresh immediately)
      await tryRefreshIfNeeded();
    };
    events.forEach((e) =>
      document.addEventListener(e, updateActivity, { passive: true }),
    );

    const onVisibility = async () => {
      if (!document.hidden) await updateActivity();
    };
    const onFocus = async () => await updateActivity();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);

    return () => {
      events.forEach((e) => document.removeEventListener(e, updateActivity));
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
    };
  }, []);
  function getHighestPriorityPermission(permissions: Set<string>): string {
    const priority: Record<string, number> = {
      "provider.admin": 1,
      "enrolment_super_admin": 2,
      "corporate_enrolment_admin": 3,
      "corporate_enrolment_processor": 4,
      "corporate_endorsement_processor": 5,
      "corporate_enrolment_qc": 6,
      "corporate_endorsement_qc": 7,
    };

    let highest = "";

    for (const permission of permissions) {
      if (
        priority[permission] !== undefined &&
        (highest === "" || priority[permission] < priority[highest])
      ) {
        highest = permission;
      }
    }

    return highest;
  }


  const dispatch = useAppDispatch()
  const { selectedRoles } = useAppSelector((state) => state.tpa);

  useEffect(() => {
    if (!isKeycloakEnabled()) {
      // Local login: restore the session saved by a previous sign-in, if still valid.
      const stored = getStoredToken();
      if (!stored || isTokenExpired(stored)) {
        clearStoredToken();
        setInitialized(true);
        return;
      }
      const startSession = (info: any) => {
        setToken(stored);
        currentToken = stored;
        setUserInfo(info);
        // The active role comes from the signed token, so it survives a refresh without being stored separately.
        const activeRole = activeRoleFromToken(stored);
        if (activeRole) dispatch(setSelectedRoles([activeRole]));
        setAuthenticated(true);
        setInitialized(true);
      };
      fetchCurrentUser(stored)
        .then(startSession)
        .catch((err) => {
          if (err instanceof LocalAuthError && err.unauthorized) {
            // Rejected by the server (e.g. user removed or secret changed): sign in again.
            clearStoredToken();
            setInitialized(true);
          } else {
            // Server unreachable: keep the unexpired session from the token's own claims.
            startSession(userInfoFromToken(stored));
          }
        });
      return;
    }

    const kc = keycloak;
    kcRef.current = kc;
    setKcInstance(kc);
    kc.init({
      onLoad: "login-required",
      pkceMethod: "S256",
      checkLoginIframe: false,
    })
      .then(async (auth: boolean) => {
        if (auth) {
          // set token first so children never render with authenticated=true and token=null
          setToken(kc.token ?? null);
          currentToken = kc.token ?? null;

          const permissions = getUserPermissions(kc.token ?? "");
          const priorityPermission = getHighestPriorityPermission(permissions);
          const effectiveRoles: string[] =
            selectedRoles?.length > 0
              ? selectedRoles
              : priorityPermission
                ? [priorityPermission]
                : [];
          dispatch(setSelectedRoles(effectiveRoles));

          try {
            const info = await kc.loadUserInfo();
            setUserInfo(info ?? null);
          } catch {
            setUserInfo(null);
          }
        }

        setInitialized(true);
        setAuthenticated(Boolean(auth));

        if (auth) {
          // broadcast initial token if BC is available
          try {
            const bc = bcRef.current;
            if (bc)
              bc.postMessage({
                type: "token",
                token: kc.token ?? null,
                ts: Date.now(),
              });
          } catch {
            /* ignore */
          }

          // periodic check
          const CHECK_INTERVAL_MS = 10_000; // check every 10s

          // clear any previous
          if (refreshIntervalRef.current) {
            window.clearInterval(refreshIntervalRef.current);
            refreshIntervalRef.current = null;
          }

          // refresh + inactivity logout are both handled inside tryRefreshIfNeeded
          refreshIntervalRef.current = window.setInterval(() => {
            void tryRefreshIfNeeded();
          }, CHECK_INTERVAL_MS);
        } else {
          // not authenticated -> trigger login once
          if (!loginTriggeredRef.current) {
            loginTriggeredRef.current = true;
            try {
              kc.login();
            } catch {
              /* ignore */
            }
          }
        }
      })
      .catch(() => {
        setInitialized(true);
        setAuthenticated(false);
        setUserInfo(null);
        setToken(null);
        currentToken = null;
      });

    return () => {
      if (refreshIntervalRef.current) {
        window.clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      currentToken = null;
    };
  }, []);

  /* ------------------------------
      LOCAL LOGIN: cross-tab sync and expiry
  ------------------------------- */
  useEffect(() => {
    if (isKeycloakEnabled()) return;

    // Login or logout in another tab: reload so this tab matches.
    const onStorage = (event: StorageEvent) => {
      if (isTokenStorageEvent(event) && getStoredToken() !== currentToken) {
        window.location.replace("/");
      }
    };
    window.addEventListener("storage", onStorage);

    // Sign out when the token expires while the page is open.
    let expiryTimer: ReturnType<typeof setTimeout> | undefined;
    if (token) {
      try {
        const { exp } = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        const msLeft = exp * 1000 - Date.now();
        // setTimeout overflows above ~24.8 days; local tokens last hours.
        if (msLeft < 2 ** 31 - 1) {
          expiryTimer = setTimeout(() => endLocalSession(false), Math.max(0, msLeft));
        }
      } catch {
        /* malformed token: the next API call will fail and the user can sign in again */
      }
    }

    return () => {
      window.removeEventListener("storage", onStorage);
      clearTimeout(expiryTimer);
    };
  }, [token]);

  /* ------------------------------
      ensureValidToken FOR API CALLS
  ------------------------------- */
  // default minValidity set to 30 seconds so calls will try to refresh if <30s remains
  const ensureValidToken = async (minValidity = 30) => {
    if (!isKeycloakEnabled()) {
      if (currentToken && isTokenExpired(currentToken, 0)) {
        endLocalSession();
        return null;
      }
      return currentToken;
    }

    const kc = kcRef.current;
    if (!kc) return null;

    const accessLeft = secsUntilAccessExpiry(kc);
    const refreshLeft = secsUntilRefreshExpiry(kc);

    // If both expired -> logout & null
    if (refreshLeft <= 0 && accessLeft <= 0) {
      await forceLogout();
      return null;
    }

    // If access has enough time, return it
    if (accessLeft > minValidity && kc.token) {
      return kc.token;
    }

    // if another update is happening, wait briefly
    if (updatingRef.current) {
      await waitForUpdatingClear(updatingRef, 2000);
      if (kc.token && secsUntilAccessExpiry(kc) > minValidity) return kc.token;
    }

    updatingRef.current = true;
    try {
      await kc.updateToken(minValidity);
      setToken(kc.token ?? null);
      currentToken = kc.token ?? null;

      // broadcast new token if BC available
      try {
        const bc = bcRef.current;
        if (bc)
          bc.postMessage({
            type: "token",
            token: kc.token ?? null,
            ts: Date.now(),
          });
      } catch {
        /* ignore */
      }

      return kc.token ?? null;
    } catch (err) {
      console.warn("ensureValidToken updateToken failed", err);
      // Only logout if refresh token is really gone; a network glitch should not kill the session
      if (secsUntilRefreshExpiry(kc) <= 0) {
        await forceLogout();
        return null;
      }
      return secsUntilAccessExpiry(kc) > 0 ? (kc.token ?? null) : null;
    } finally {
      updatingRef.current = false;
    }
  };

  /* ------------------------------
      LOGIN / LOGOUT / UPDATE
  ------------------------------- */
  /** Local mode: drop the session and reload, which shows the login page with clean state. */
  const endLocalSession = (callServer = true) => {
    if (callServer) notifyLogout(currentToken);
    clearStoredToken();
    currentToken = null;
    // The next user must not inherit this user's switched role.
    dispatch(setSelectedRoles([]));
    window.location.replace("/");
  };

  const loginWithPassword = async (username: string, password: string) => {
    if (isKeycloakEnabled()) {
      throw new Error("Password login is only available when Keycloak is disabled");
    }
    const { token: newToken } = await requestLocalLogin(username, password);
    storeToken(newToken);
    // Start from "/" so the app opens the dashboard for this user's role.
    dispatch(setSelectedRoles([]));
    window.location.replace("/");
  };

  const login = () => {
    if (!isKeycloakEnabled()) {
      // The local login page is shown automatically while signed out.
      return;
    }
    try {
      keycloak?.login();
    } catch {
      /* ignore */
    }
  };

  const logout = async (redirectUri?: string) => {
    if (!isKeycloakEnabled()) {
      endLocalSession();
      return;
    }
    try {
      await keycloak?.logout({
        redirectUri: redirectUri ?? window.location.origin,
      });
    } catch {
      /* ignore */
    }
    setAuthenticated(false);
    setUserInfo(null);
    setToken(null);
    currentToken = null;
    // broadcast logout if BC available
    try {
      const bc = bcRef.current;
      if (bc) bc.postMessage({ type: "logout", ts: Date.now() });
    } catch {
      /* ignore */
    }
  };

  const updateToken = async (minValidity = 30) => {
    if (!isKeycloakEnabled()) {
      // Local tokens are not refreshable; they last until expiry (auth.jwt.ttl, default 8h).
      return Boolean(currentToken && !isTokenExpired(currentToken, minValidity));
    }
    const kc = kcInstance;
    if (!kc) return false;
    if (updatingRef.current) return Boolean(kc.token);
    updatingRef.current = true;
    try {
      await kc.updateToken(minValidity);
      setToken(kc.token ?? null);
      currentToken = kc.token ?? null;
      try {
        const bc = bcRef.current;
        if (bc)
          bc.postMessage({
            type: "token",
            token: kc.token ?? null,
            ts: Date.now(),
          });
      } catch {
        /* ignore */
      }
      return Boolean(kc.token);
    } catch {
      return false;
    } finally {
      updatingRef.current = false;
    }
  };

  const getRemainingSeconds = () => {
    const kc = kcRef.current;
    if (!kc) return { access: 0, refresh: 0 };
    return {
      access: secsUntilAccessExpiry(kc),
      refresh: secsUntilRefreshExpiry(kc),
    };
  };

  const value = useMemo(
    () => ({
      keycloak: kcInstance,
      initialized,
      authenticated,
      userInfo,
      token,
      login,
      loginWithPassword,
      logout,
      updateToken,
      ensureValidToken,
      getRemainingSeconds,
    }),
    [kcInstance, initialized, authenticated, userInfo, token],
  );

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Loading authentication...</div>
      </div>
    );
  }
  if (!authenticated && !isKeycloakEnabled()) {
    return <LocalLoginPage onLogin={loginWithPassword} />;
  }
  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Redirecting to login...</div>
      </div>
    );
  }

  return (
    <KeycloakContext.Provider value={value}>
      {children}
    </KeycloakContext.Provider>
  );
};

export const useKeycloak = () => {
  const ctx = useContext(KeycloakContext);
  if (!ctx) throw new Error("useKeycloak must be used inside KeycloakProvider");
  return ctx;
};

// src/auth/provider.tsx
import { useEffect, useReducer, ReactNode } from "react";

import { isTokenValid, setSession } from "@/utils/jwt";
import { AuthProvider as AuthContext, AuthContextType } from "./context";
import { User } from "@/@types/user";

import {
  fetchTokenByPassword,
  TokenResponse,
} from "./tokenClient";

// ----------------------------------------------------------------------

interface AuthAction {
  type:
    | "INITIALIZE"
    | "LOGIN_REQUEST"
    | "LOGIN_SUCCESS"
    | "LOGIN_ERROR"
    | "LOGOUT";
  payload?: Partial<AuthContextType>;
}
// change isAuthenticated false to true
const initialState: AuthContextType = {
  isAuthenticated: true,
  isLoading: false,
  isInitialized: false,
  errorMessage: null,
  user: null,
  login: async () => {},
  logout: async () => {},
};

const reducerHandlers: Record<
  AuthAction["type"],
  (state: AuthContextType, action: AuthAction) => AuthContextType
> = {
  // change isAuthenticated false to true
  INITIALIZE: (state, action) => ({
    ...state,
    // isAuthenticated: action.payload?.isAuthenticated ?? false,
    isAuthenticated: true,
    isInitialized: true,
    user: action.payload?.user ?? null,
    errorMessage: null,
  }),

  LOGIN_REQUEST: (state) => ({
    ...state,
    isLoading: true,
    errorMessage: null,
  }),

  LOGIN_SUCCESS: (state, action) => ({
    ...state,
    isAuthenticated: true,
    isLoading: false,
    user: action.payload?.user ?? null,
    errorMessage: null,
  }),

  LOGIN_ERROR: (state, action) => ({
    ...state,
    errorMessage: action.payload?.errorMessage ?? "An error occurred",
    isLoading: false,
  }),

  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    user: null,
  }),
};

const reducer = (
  state: AuthContextType,
  action: AuthAction,
): AuthContextType => {
  const handler = reducerHandlers[action.type];
  return handler ? handler(state, action) : state;
};

// Token storage keys
const ACCESS_KEY = "auth_access_token";
const REFRESH_KEY = "auth_refresh_token";
const EXPIRES_AT = "auth_expires_at";


function decodeJwt<T = any>(token?: string | null): T | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}


function saveTokensToStorage(t: TokenResponse | null) {
  if (!t) return;
  if (t.access_token) localStorage.setItem(ACCESS_KEY, t.access_token);
  if (t.refresh_token) localStorage.setItem(REFRESH_KEY, t.refresh_token);
  if (t.expires_in) {
    const at = Date.now() + t.expires_in * 1000;
    localStorage.setItem(EXPIRES_AT, String(at));
  }
}

/**
 * Clear token storage
 */
function clearTokenStorage() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(EXPIRES_AT);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const init = async () => {
      try {
        const access = window.localStorage.getItem(ACCESS_KEY);

        if (access && isTokenValid(access)) {
          setSession(access);

          const payload: any = decodeJwt(access);
          const user: User = {
            id: payload?.sub ?? "",
            username:
              payload?.preferred_username ?? payload?.preffered_username ?? "",
            email: payload?.email ?? "",
            name: payload?.name ?? "",
          } as any;

          dispatch({
            type: "INITIALIZE",
            payload: { isAuthenticated: true, user },
          });
          return;
        }

        // If no valid access token, treat as unauthenticated (no refresh)
        clearTokenStorage();
        dispatch({
          type: "INITIALIZE",
          payload: { isAuthenticated: false, user: null },
        });
      } catch (err) {
        console.error("Auth init error:", err);
        clearTokenStorage();
        dispatch({
          type: "INITIALIZE",
          payload: { isAuthenticated: false, user: null },
        });
      }
    };

    init();
  }, []);


  const login = async (credentials: { username: string; password: string }) => {
    dispatch({ type: "LOGIN_REQUEST" });

    try {
      // Keycloak token exchange (frontend-only dev flow)
      const tokenRes = await fetchTokenByPassword(
        credentials.username,
        credentials.password,
      );

      if ((tokenRes as any).error) {
        const message =
          `${(tokenRes as any).error} ${(tokenRes as any).error_description ?? ""}`.trim();
        dispatch({ type: "LOGIN_ERROR", payload: { errorMessage: message } });
        throw new Error(message || "Login failed");
      }

      // Save tokens and set session header (for axios calls)
      saveTokensToStorage(tokenRes);
      setSession(tokenRes.access_token!);

      // Build user from token payload (no role-based API call)
      const payload: any = decodeJwt(tokenRes.access_token!);
      const user: User = {
        id: payload?.sub ?? "",
        username:
          payload?.preferred_username ?? payload?.preffered_username ?? "",
        email: payload?.email ?? "",
        name: payload?.name ?? "",
        // intentionally not populating role/permissions from backend
      } as any;

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user },
      });
      return;
    } catch (err: any) {
      if (!(err instanceof Error)) {
        dispatch({
          type: "LOGIN_ERROR",
          payload: { errorMessage: "Login failed" },
        });
      }
      throw err;
    }
  };

  /**
   * logout:
   * - clears tokens/session
   * - dispatches LOGOUT
   */
  const logout = async (): Promise<void> => {
    try {
      setSession(null);
      clearTokenStorage();
      dispatch({ type: "LOGOUT" });
      return;
    } catch (err) {
      console.error("Logout error:", err);
      try {
        setSession(null);
        clearTokenStorage();
      } catch {
        // handle error
      }
      dispatch({ type: "LOGOUT" });
      return;
    }
  };

  if (!children) {
    return null;
  }

  return (
    <AuthContext
      value={{
        ...state,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext>
  );
}

export default AuthProvider;

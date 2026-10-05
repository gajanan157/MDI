import { type FormEvent, useState } from "react";
import Logo from "@/assets/mdilogo.svg?react";

/**
 * Sign-in screen for local login (VITE_ENABLE_KEYCLOAK="false").
 * Rendered by KeycloakProvider before the theme, locale and router providers exist,
 * so it uses plain elements instead of the shared UI components.
 */
export function LocalLoginPage({
  onLogin,
}: {
  onLogin: (username: string, password: string) => Promise<void>;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!username.trim() || !password) {
      setError("Enter your username and password.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onLogin(username.trim(), password);
      // On success the page reloads into the app, so there is nothing more to do here.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <Logo className="mx-auto h-14 w-24" />
          <h1 className="mt-4 text-2xl font-semibold text-gray-700">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to the Enrolment System</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          noValidate
        >
          <div>
            <label htmlFor="local-login-username" className="mb-1 block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="local-login-username"
              className={inputClass}
              autoComplete="username"
              autoFocus
              value={username}
              disabled={submitting}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="local-login-password" className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="local-login-password"
              type="password"
              className={inputClass}
              autoComplete="current-password"
              value={password}
              disabled={submitting}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}

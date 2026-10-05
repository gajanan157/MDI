// Import Dependencies
import { Outlet, ScrollRestoration } from "react-router";
import { lazy } from "react";

// Local Imports
import { useAuthContext } from "@/app/contexts/auth/context";
import { SplashScreen } from "@/components/template/SplashScreen";
import { Loadable } from "@/components/shared/Loadable";
import { Progress } from "@/components/template/Progress";
import { ProviderAlertDialogHost } from "@/app/pages/dashboards/providerManagernt/shared/ProviderAlertDialog";
import { NotificationProvider } from "@/app/contexts/notifications/Provider";

const Toaster = Loadable(lazy(() => import("@/components/template/Toaster")));
// const Customizer = Loadable(
//   lazy(() => import("@/components/template/Customizer")),
// );
// const Customizer = Loadable(
//   lazy(() => import("components/template/Customizer")),
// );
const Tooltip = Loadable(lazy(() => import("@/components/template/Tooltip")));

// ----------------------------------------------------------------------

function Root() {
  const { isInitialized } = useAuthContext();

  if (!isInitialized) {
    return <SplashScreen />;
  }

  return (
    // Real-time notifications from workflow-service (/ws/notifications), shown as toasts.
    <NotificationProvider>
    <div className="flex min-h-[var(--app-vh)] flex-1 flex-col">
      <Progress />
      <ScrollRestoration />
      {/* Single flex child so the app shell fills the viewport (PWA + browser); avoids #root grid splitting across Progress/Outlet/Toaster */}
      <div className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </div>
      <Tooltip />
      <Toaster />
      <ProviderAlertDialogHost />
      {/* <Customizer /> */}
    </div>
    </NotificationProvider>
  );
}

export default Root;

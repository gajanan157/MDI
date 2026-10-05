// Import Dependencies
import clsx from "clsx";
import { Outlet } from "react-router";

// Local Imports
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

// ----------------------------------------------------------------------

export default function MainLayout() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Header />
      <main
        className={clsx(
          "main-content transition-content flex min-h-0 flex-1 flex-col [min-height:var(--app-vh)]",
        )}
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <Outlet />
        </div>
      </main>
      <Sidebar />
    </div>
  );
}

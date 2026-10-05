// Import Dependencies
import { Outlet, useNavigation } from "react-router";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { CustomLoader } from "@/components/shared/CustomLoader";

export default function Sideblock() {
  const navigation = useNavigation();
  const isPageLoading =
    navigation.state === "loading" && navigation.formData == null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Header />

      {/* Mobile header uses py-2 + h-8 controls (~3.25rem); sm+ is min-h-10 (2.5rem). */}
      <main className="main-content transition-content relative flex min-h-0 flex-1 flex-col pt-[max(3.25rem,calc(env(safe-area-inset-top,0px)+2.75rem))] sm:pt-[max(2.5rem,env(safe-area-inset-top,0px))]">
        {isPageLoading ? (
          <CustomLoader
            isLoading={true}
            message="Loading..."
            className="min-h-[calc(var(--app-vh)-max(2.5rem,env(safe-area-inset-top,0px)))] max-md:min-h-[calc(var(--app-vh)-env(safe-area-inset-top,0px)-3.25rem)]"
            logoSize="size-28"
            progressBarWidth="w-64"
          />
        ) : (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <Outlet />
          </div>
        )}
      </main>
      <Sidebar />
    </div>
  );
}

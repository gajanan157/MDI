// Import Dependencies
import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { CustomLoader } from "@/components/shared/CustomLoader";

// ----------------------------------------------------------------------

export function GlobalLoader() {
  const { isLoading } = useAppSelector((state) => state.globalLoading);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isLoading) {
      // Show loader after 300ms delay to avoid flickering on fast API calls
      timeoutId = setTimeout(() => {
        setShowLoader(true);
      }, 300);
    } else {
      // Hide immediately when loading stops
      setShowLoader(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading]);

  return <CustomLoader isLoading={showLoader && isLoading} fullScreen />;
}

GlobalLoader.displayName = "GlobalLoader";

export default GlobalLoader;


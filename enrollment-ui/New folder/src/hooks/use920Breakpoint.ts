import { useState, useEffect } from "react";

/**
 * Custom hook to check if window width is <= 920px
 * @returns boolean indicating if width is <= 920px
 */
export function use920Breakpoint() {
  const [is920AndDown, setIs920AndDown] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= 920;
  });

  useEffect(() => {
    const handleResize = () => {
      setIs920AndDown(window.innerWidth <= 920);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return is920AndDown;
}


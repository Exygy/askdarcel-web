import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/* 
  Resets focus state for a11y by focusing and unfocusing an off-screen element at the top of the page when the page location changes.
  The focus reset occurs on all page location changes except for top-level category and search page filter changes.
*/
export const NavigationFocusReset: React.FC = () => {
  const location = useLocation();
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const previousPathRef = useRef<string>("");

  useEffect(() => {
    const currentPath = location.pathname;

    const isCategoryPage = currentPath.includes("results");
    const isSearchPage = currentPath.includes("query");
    const pathHasFilters = isCategoryPage || isSearchPage;

    // Check if the current path is different from the previous path
    const pathChanged = currentPath !== previousPathRef.current;

    // Focus reset should occur if the path changed and it's not just a filter change
    if (pathChanged && (!pathHasFilters || previousPathRef.current === "")) {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.focus();
        hiddenInputRef.current.blur();
      }
    }

    previousPathRef.current = currentPath;
  }, [location]);

  return (
    <input
      ref={hiddenInputRef}
      style={{ position: "absolute", left: "-9999px" }}
      aria-hidden="true"
      tabIndex={-1}
    />
  );
};

export default NavigationFocusReset;

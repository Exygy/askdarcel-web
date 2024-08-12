import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/* 
  Resets focus state for a11y, by focusing and unfocusing an off-screen element at the top of the page when page location changes
  Since filters change the location, the logic is to only reset focus when a main-level page change occurs (not when user filters a search)
*/
export const NavigationFocusReset: React.FC = () => {
  const location = useLocation();
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const previousPathSegmentRef = useRef<string>("");

  useEffect(() => {
    const currentPathSegment = location.pathname.split("/")[1];

    if (currentPathSegment !== previousPathSegmentRef.current) {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.focus();
        hiddenInputRef.current.blur();
      }
      previousPathSegmentRef.current = currentPathSegment;
    }
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

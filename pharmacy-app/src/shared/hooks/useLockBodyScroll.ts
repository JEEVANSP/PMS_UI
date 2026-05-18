/**
 * Hook to lock/unlock body scroll
 * Prevents scrolling when modals, drawers, etc. are open
 */

import { useEffect } from "react";

export function useLockBodyScroll(isLocked: boolean = true): void {
  useEffect(() => {
    if (!isLocked) return;

    // Store original overflow value
    const originalOverflow = document.body.style.overflow;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Lock scroll
    document.body.style.overflow = "hidden";
    // Add padding to compensate for scrollbar width (prevents layout shift)
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // Cleanup: restore original state
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = "";
    };
  }, [isLocked]);
}

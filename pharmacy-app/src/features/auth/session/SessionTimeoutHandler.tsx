import { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@app/store";
import { useSessionTimeout } from "./useSessionTimeout";
import SessionTimeoutModal from "@auth/components/SessionTimeoutModal";
import { refreshAccess, logout, serverLogout } from "@auth/slices";
import {
  SESSION_INACTIVITY_WARNING_MS,
  SESSION_WARNING_COUNTDOWN_SEC,
} from "./session.config";

export default function SessionTimeoutHandler() {
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(
    (s) => Boolean(s.auth.user)
  );

  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(SESSION_WARNING_COUNTDOWN_SEC);

  // ✅ Triggered AFTER X seconds of inactivity
  const handleInactive = useCallback(() => {
    setShowWarning(true);
    setCountdown(SESSION_WARNING_COUNTDOWN_SEC);
  }, []);

  // ✅ Inactivity timer (paused during warning)
  useSessionTimeout({
    inactivityMs: SESSION_INACTIVITY_WARNING_MS,
    enabled: isAuthenticated && !showWarning,
    onInactive: handleInactive,
  });

  // ✅ Countdown while warning is shown
  useEffect(() => {
    if (!showWarning) return;

    const timer = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [showWarning]);

  // ✅ Logout when countdown reaches 0
  useEffect(() => {
    if (!showWarning || countdown > 0) return;

    dispatch(serverLogout());
    dispatch(logout());
  }, [countdown, showWarning, dispatch]);

  // ✅ HARD RESET after logout (this fixes your last issue)
  useEffect(() => {
    if (!isAuthenticated) {
      const resetTimer = window.setTimeout(() => {
        setShowWarning(false);
        setCountdown(SESSION_WARNING_COUNTDOWN_SEC);
      }, 0);

      return () => window.clearTimeout(resetTimer);
    }
  }, [isAuthenticated]);

  // ✅ Continue session works correctly
  const continueSession = async () => {
    try {
      await dispatch(refreshAccess()).unwrap();
      setShowWarning(false); // re‑enables inactivity timer
      setCountdown(SESSION_WARNING_COUNTDOWN_SEC);
    } catch {
      // refresh failed → countdown continues
    }
  };

  return (
    <SessionTimeoutModal
      open={showWarning}
      countdown={countdown}
      onContinue={continueSession}
      onLogout={() => setCountdown(0)}
    />
  );
}

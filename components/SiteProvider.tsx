"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

interface SiteContextValue {
  toast: (msg: string) => void;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside <SiteProvider>");
  return ctx;
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const [toastMsg, setToastMsg] = useState("");
  const [toastShown, setToastShown] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastShown(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastShown(false), 3200);
  }, []);

  return (
    <SiteContext.Provider value={{ toast }}>
      {children}
      <div className={`toast${toastShown ? " is-shown" : ""}`} role="status" aria-live="polite">
        {toastMsg}
      </div>
    </SiteContext.Provider>
  );
}

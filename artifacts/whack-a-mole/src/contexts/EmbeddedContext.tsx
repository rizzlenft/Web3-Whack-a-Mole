import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface EmbeddedContextValue {
  embedded: boolean;
}

const EmbeddedContext = createContext<EmbeddedContextValue>({ embedded: false });

export function EmbeddedProvider({ children }: { children: ReactNode }) {
  const [embedded] = useState(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    return params.get("embed") === "1" || window.self !== window.top;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("embedded", embedded);
    document.body.classList.toggle("overflow-hidden", embedded);
    return () => {
      document.documentElement.classList.remove("embedded");
      document.body.classList.remove("overflow-hidden");
    };
  }, [embedded]);

  const value = useMemo(() => ({ embedded }), [embedded]);
  return <EmbeddedContext.Provider value={value}>{children}</EmbeddedContext.Provider>;
}

export function useEmbedded() {
  return useContext(EmbeddedContext).embedded;
}

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface PrivacyContextValue {
  hidden: boolean;
  toggle: () => void;
  mask: (text: string) => string;
}

const PrivacyContext = createContext<PrivacyContextValue>({
  hidden: false,
  toggle: () => {},
  mask: (t) => t,
});

const MASK = "••••••";

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem("pb_hide_amounts") === "1";
    } catch {
      return false;
    }
  });

  const toggle = useCallback(() => {
    setHidden((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("pb_hide_amounts", next ? "1" : "0");
      } catch {
        /* sin localStorage */
      }
      return next;
    });
  }, []);

  const mask = useCallback(
    (text: string) => (hidden ? MASK : text),
    [hidden]
  );

  const value = useMemo(
    () => ({ hidden, toggle, mask }),
    [hidden, toggle, mask]
  );

  return (
    <PrivacyContext.Provider value={value}>{children}</PrivacyContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePrivacy() {
  return useContext(PrivacyContext);
}

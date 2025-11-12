"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface UserPanelContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const UserPanelContext = createContext<UserPanelContextValue | undefined>(
  undefined,
);

interface UserPanelProviderProps {
  children: ReactNode;
}

export function UserPanelProvider({ children }: UserPanelProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((value) => !value), []);

  const value = useMemo(
    () => ({ isOpen, open, close, toggle }),
    [isOpen, open, close, toggle],
  );

  return (
    <UserPanelContext.Provider value={value}>
      {children}
    </UserPanelContext.Provider>
  );
}

export function useUserPanel() {
  const context = useContext(UserPanelContext);

  if (!context) {
    throw new Error("useUserPanel must be used within a UserPanelProvider");
  }

  return context;
}

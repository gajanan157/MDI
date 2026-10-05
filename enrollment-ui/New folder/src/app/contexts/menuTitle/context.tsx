import { createContext, useContext, useState, ReactNode } from "react";

interface MenuTitleContextType {
  title: string;
  setTitle: (title: string) => void;
}

const MenuTitleContext = createContext<MenuTitleContextType | undefined>(
  undefined,
);

export function MenuTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("MIS"); // default
  return (
    <MenuTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </MenuTitleContext.Provider>
  );
}

export function useMenuTitle() {
  const ctx = useContext(MenuTitleContext);
  if (!ctx) {
    throw new Error("useMenuTitle must be used inside MenuTitleProvider");
  }
  return ctx;
}

import { useContext } from "react";
import { UserContext } from "./UserContextDef";
import type { UserContextType } from "./UserContextDef";

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

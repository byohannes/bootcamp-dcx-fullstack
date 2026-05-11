import { createContext } from "react";
import type { User } from "../types";

export interface UserContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined,
);

import { useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../types";
import { UserContext } from "./UserContextDef";

const USER_STORAGE_KEY = "bike-booking-user";

interface UserProviderProps {
  children: ReactNode;
}

// Load user from localStorage on initial load
function getInitialUser(): User | null {
  try {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      return JSON.parse(storedUser);
    }
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
  return null;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(getInitialUser);

  function login(loggedInUser: User) {
    setUser(loggedInUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

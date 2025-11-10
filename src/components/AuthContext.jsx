// src/components/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    firstName: localStorage.getItem("firstName") || null,
    isAuthed: !!localStorage.getItem("authToken"),
  });

  const login = (firstName, token) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("firstName", firstName);
    setUser({ firstName, isAuthed: true });
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("firstName");
    setUser({ firstName: null, isAuthed: false });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

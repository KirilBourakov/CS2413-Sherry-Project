import { useState, createContext } from "react";
import { getToken } from "../../scripts/authentication";

export const AuthContext = createContext()

export default function AuthProvider({ children }){
    const [authObj, setAuthObj] = useState(getToken());
  
    return (
      <AuthContext.Provider value={{ authObj, setAuthObj }}>
        {children}
      </AuthContext.Provider>
    );
};
import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";
import { initSocket, disconnectSocket } from "../utils/socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      authAPI.getMe()
        .then((res) => {
          setUser(res.data.user);
          initSocket(res.data.user._id);
        })
        .catch(() => localStorage.removeItem("token")) 
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    initSocket(res.data.user._id);
    return res.data;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    // localStorage.setItem("token", res.data.token);
    // setUser(res.data.user);
    // initSocket(res.data.user._id);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
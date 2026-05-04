import { createContext, useState, useEffect, useContext } from 'react';
import { login as loginApi, register as registerApi, getProfile } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);

  // Load user profile when token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchUserInfo();
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  const fetchUserInfo = async () => {
    try {
      const data = await getProfile();
      if (data.code === 1000) {
        setUser(data.result);
      }
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      setUser(null);
    }
  };

  const login = async (username, password) => {
    try {
      const data = await loginApi(username, password);
      if (data.code === 1000) {
        setToken(data.result.token);
        return true;
      } else {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const data = await registerApi(userData);
      if (data.code === 1000) {
        return true;
      } else {
        throw new Error(data.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

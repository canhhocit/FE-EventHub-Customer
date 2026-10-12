/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from 'react';
import {
  login as loginApi,
  register as registerApi,
  getProfile,
  setUnauthorizedHandler,
  setTokenRefreshedHandler,
  isTokenRefreshable,
} from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const readToken = () => {
  try {
    const token = localStorage.getItem('token');
    // Keep an expired token: the API client trades it in at /auth/refresh on
    // the first request. Only drop one that isn't a JWT at all.
    if (token && !isTokenRefreshable(token)) {
      localStorage.removeItem('token');
      return null;
    }
    return token;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(readToken);
  const [user, setUser] = useState(null);
  // True until we know whether the stored token is still good, so pages don't
  // flash "please log in" at a user who is in fact logged in.
  const [initializing, setInitializing] = useState(!!readToken());
  const tokenRef = useRef(token);

  const applyToken = useCallback((newToken) => {
    tokenRef.current = newToken;
    try {
      if (newToken) localStorage.setItem('token', newToken);
      else localStorage.removeItem('token');
    } catch {
      /* storage unavailable (private mode) — session stays in memory */
    }
    setTokenState(newToken);
  }, []);

  const logout = useCallback(() => {
    applyToken(null);
    setUser(null);
  }, [applyToken]);

  // A 401 on any protected request means the token is dead: clear it once,
  // centrally, instead of leaving every page to guess.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      applyToken(null);
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, [applyToken]);

  // The API client already stored the refreshed token. `token` state only
  // tells pages whether someone is signed in, so leave it alone — changing it
  // would refetch everything keyed on it (cart, profile) every hour.
  useEffect(() => {
    setTokenRefreshedHandler((newToken) => {
      tokenRef.current = newToken;
    });
    return () => setTokenRefreshedHandler(null);
  }, []);

  // Restore the session on a hard refresh.
  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setUser(null);
      setInitializing(false);
      return;
    }
    if (user) {
      setInitializing(false);
      return;
    }

    (async () => {
      try {
        const data = await getProfile();
        if (cancelled) return;
        if (data?.code === 1000 && data.result) {
          setUser(data.result);
        } else {
          applyToken(null);
          setUser(null);
        }
      } catch {
        if (!cancelled) {
          applyToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const isCustomer = (profile) =>
    Array.isArray(profile?.roles)
      ? profile.roles.some((role) => role?.name === 'CUSTOMER')
      : false;

  const login = async (username, password) => {
    const data = await loginApi(username, password);

    if (data?.code !== 1000 || !data.result?.token) {
      throw new Error(data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    }

    const newToken = data.result.token;
    // getProfile reads the token from storage, so it has to land there first.
    try {
      localStorage.setItem('token', newToken);
    } catch {
      /* ignore */
    }

    let profile;
    try {
      const profileData = await getProfile();
      if (profileData?.code !== 1000 || !profileData.result) {
        throw new Error('Không lấy được thông tin tài khoản.');
      }
      profile = profileData.result;
    } catch (err) {
      applyToken(null);
      setUser(null);
      throw new Error(err.message || 'Không lấy được thông tin tài khoản.', {
        cause: err,
      });
    }

    if (!isCustomer(profile)) {
      applyToken(null);
      setUser(null);
      throw new Error(
        'Tài khoản này không phải tài khoản khách hàng. Vui lòng dùng cổng dành cho ban tổ chức.',
      );
    }

    setUser(profile);
    applyToken(newToken);
    setInitializing(false);
    return profile;
  };

  const register = async (userData) => {
    const data = await registerApi(userData);
    if (data?.code !== 1000) {
      throw new Error(data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    }
    return data.result || true;
  };

  const refreshUser = useCallback(async () => {
    if (!tokenRef.current) return null;
    const data = await getProfile();
    if (data?.code === 1000 && data.result) {
      setUser(data.result);
      return data.result;
    }
    return null;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        initializing,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

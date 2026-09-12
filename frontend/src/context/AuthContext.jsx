import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "token";
const USER_KEY = "user";
const EMAIL_KEY = "prepmate-last-email";

const readSavedUser = () => {
  try {
    const savedUser = localStorage.getItem(USER_KEY);

    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

const readSavedToken = () => localStorage.getItem(TOKEN_KEY);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readSavedUser);
  const [token, setToken] = useState(readSavedToken);
  const [isInitializing, setIsInitializing] = useState(true);

  const saveAuthentication = useCallback((newToken, authenticatedUser) => {
    if (!newToken || !authenticatedUser) {
      throw new Error("Authentication information is incomplete");
    }

    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(authenticatedUser));

    if (authenticatedUser.email) {
      localStorage.setItem(EMAIL_KEY, authenticatedUser.email);
    }

    setToken(newToken);
    setUser(authenticatedUser);
  }, []);

  const clearAuthentication = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const verifySavedSession = async () => {
      const savedToken = readSavedToken();
      const savedUser = readSavedUser();

      if (!savedToken) {
        setToken(null);
        setUser(null);
        setIsInitializing(false);
        return;
      }

      setToken(savedToken);

      if (savedUser) {
        setUser(savedUser);
      }

      try {
        const response = await api.get("/users/profile");

        const verifiedUser = response.data.user;

        saveAuthentication(savedToken, verifiedUser);
      } catch (error) {
        const status = error.response?.status;

        console.error(
          "Session verification failed:",
          error.response?.data?.message || error.message,
        );

        // Logout only when the saved token is invalid or expired.
        if (status === 401 || status === 403) {
          clearAuthentication();
        } else {
          // Keep the locally saved session during a temporary
          // network/server problem.
          setToken(savedToken);
          setUser(savedUser);
        }
      } finally {
        setIsInitializing(false);
      }
    };

    verifySavedSession();
  }, [clearAuthentication, saveAuthentication]);

  const register = useCallback(
    async (formData) => {
      const response = await api.post("/auth/register", formData);

      saveAuthentication(response.data.token, response.data.user);

      return response.data;
    },
    [saveAuthentication],
  );

  const login = useCallback(
    async (email, password) => {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      saveAuthentication(response.data.token, response.data.user);

      localStorage.setItem(EMAIL_KEY, email);

      return response.data;
    },
    [saveAuthentication],
  );

  const logout = useCallback(() => {
    // Keep the last email for convenience, but never store
    // the user's password.
    clearAuthentication();
  }, [clearAuthentication]);

  const updateUser = useCallback((updatedUser) => {
    if (!updatedUser) {
      return;
    }

    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

    if (updatedUser.email) {
      localStorage.setItem(EMAIL_KEY, updatedUser.email);
    }
  }, []);

  const rememberedEmail = localStorage.getItem(EMAIL_KEY) || "";

  const value = useMemo(
    () => ({
      user,
      token,
      rememberedEmail,
      isAuthenticated: Boolean(user && token),
      isInitializing,
      register,
      login,
      logout,
      updateUser,
    }),
    [
      user,
      token,
      rememberedEmail,
      isInitializing,
      register,
      login,
      logout,
      updateUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};

export default AuthContext;

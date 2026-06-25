import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// Session TTL used when JWT expiry isn't available (ms)
const AUTH_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

const decodeJwtExpiry = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const decoded = atob(padded);
    const parsed = JSON.parse(decoded);
    return parsed?.exp ? parsed.exp * 1000 : null;
  } catch {
    return null;
  }
};

// Create authentication context
// This allows any component to access: user, token, login, logout functions
const AuthContext = createContext();

// Provider component that wraps the app
export const AuthProvider = ({ children }) => {
  // State: current logged-in user
  const [user, setUser] = useState(null);
  
  // State: JWT token from server
  const [token, setToken] = useState(null);
  
  // State: loading flag for async operations
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  
  // State: error messages
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // On app load, verify token with backend and restore session
  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem('medilink_auth_token');
      if (!savedToken) {
        setSessionLoading(false);
        return;
      }

      // Check stored expiry before attempting verification
      const expiryStr = localStorage.getItem('medilink_auth_expiry');
      const expiryNum = expiryStr ? Number(expiryStr) : null;
      if (expiryNum && Date.now() > expiryNum) {
        // Session expired locally: clear stored session and return logged-out state
        localStorage.removeItem('medilink_auth_token');
        localStorage.removeItem('medilink_auth_user');
        localStorage.removeItem('medilink_auth_expiry');
        if (axios.defaults.headers && axios.defaults.headers.common && axios.defaults.headers.common['Authorization']) {
          delete axios.defaults.headers.common['Authorization'];
        }
        setToken(null);
        setUser(null);
        setError(null);
        setSessionLoading(false);
        return;
      }

      try {
        const response = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${savedToken}` }
        });
        const userData = response.data.user;

        setToken(savedToken);
        setUser(userData);
        setError(null);

        // Derive expiry from the saved JWT (fall back to AUTH_TOKEN_TTL_MS)
        const expiryTime = decodeJwtExpiry(savedToken) ?? Date.now() + AUTH_TOKEN_TTL_MS;
        localStorage.setItem('medilink_auth_user', JSON.stringify(userData));
        localStorage.setItem('medilink_auth_expiry', expiryTime.toString());

        // Set global Authorization header for subsequent requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Unable to verify session';
        setError(msg);

        // Clear session storage
        localStorage.removeItem('medilink_auth_token');
        localStorage.removeItem('medilink_auth_user');
        localStorage.removeItem('medilink_auth_expiry');

        // Remove global header only if it exists
        if (axios.defaults.headers && axios.defaults.headers.common && axios.defaults.headers.common['Authorization']) {
          delete axios.defaults.headers.common['Authorization'];
        }

        // Navigate to login if not already on the login page
        if (location.pathname !== '/login') navigate('/login');
      } finally {
        setSessionLoading(false);
      }
    };

    verifySession();
    // Only verify the session once when the app loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ========== LOGIN FUNCTION ==========
  // POST request to /api/auth/login with email and password
  // Returns: token and user object
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/api/auth/login', {
        email,
        password
      });
      handleAuthResponse(response.data);
      return { success: true, user: response.data.user };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // ========== REGISTER FUNCTION ==========
  // POST request to /api/auth/register with user details
  // Returns: token and user object
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/api/auth/register', userData);
      handleAuthResponse(response.data);
      return { success: true, user: response.data.user };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // ========== REGISTER DOCTOR FUNCTION ==========
  // POST request to /api/auth/register-doctor with doctor details
  const registerDoctor = async (doctorData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        '/api/auth/register-doctor',
        doctorData
      );

      handleAuthResponse(response.data);
      return { success: true, user: response.data.user };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Doctor registration failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Centralized post-auth handler: sets token/user state, localStorage, and axios header
  const handleAuthResponse = (data) => {
    const { token: newToken, user: userData } = data;
    const expiryTime = decodeJwtExpiry(newToken) ?? Date.now() + AUTH_TOKEN_TTL_MS;
    setToken(newToken);
    setUser(userData);
    setError(null);
    localStorage.setItem('medilink_auth_token', newToken);
    localStorage.setItem('medilink_auth_user', JSON.stringify(userData));
    localStorage.setItem('medilink_auth_expiry', expiryTime.toString());
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  // ========== LOGOUT FUNCTION ==========
  // Clear user, token, localStorage, and remove Authorization header
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('medilink_auth_token');
    localStorage.removeItem('medilink_auth_user');
    localStorage.removeItem('medilink_auth_expiry');
    delete axios.defaults.headers.common['Authorization'];
  };

  // ========== CONTEXT VALUE ==========
  // Exposed to all consuming components via useAuth hook
  const value = {
    user,
    token,
    loading,
    sessionLoading,
    error,
    login,
    register,
    registerDoctor,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ========== CUSTOM HOOK ==========
// Use this hook in any component to access auth state
// Example: const { user, login, logout } = useAuth();
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

  // On app load, verify token with backend and restore session
  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem('medilink_auth_token');
      if (!savedToken) {
        setSessionLoading(false);
        return;
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      try {
        const response = await axios.get('/api/auth/me');
        const userData = response.data.user;

        setToken(savedToken);
        setUser(userData);
        setError(null);

        // Renew localStorage expiry for 30 days from now
        const expiryTime = Date.now() + (30 * 24 * 60 * 60 * 1000);
        localStorage.setItem('medilink_auth_token', savedToken);
        localStorage.setItem('medilink_auth_user', JSON.stringify(userData));
        localStorage.setItem('medilink_auth_expiry', expiryTime.toString());
      } catch (err) {
        const isAuthError = err.response && (err.response.status === 401 || err.response.status === 403);

        if (isAuthError) {
          localStorage.removeItem('medilink_auth_token');
          localStorage.removeItem('medilink_auth_user');
          localStorage.removeItem('medilink_auth_expiry');
          delete axios.defaults.headers.common['Authorization'];
          navigate('/login');
        } else {
          setError('Unable to verify session. Please check your network connection.');
        }
      } finally {
        setSessionLoading(false);
      }
    };

    verifySession();
  }, [navigate]);

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

      const { token: newToken, user: userData } = response.data;

      // Decode JWT to get expiry
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      const expiryTime = payload.exp * 1000;

      // Save to state
      setToken(newToken);
      setUser(userData);

      // Save to localStorage with expiry from JWT
      localStorage.setItem('medilink_auth_token', newToken);
      localStorage.setItem('medilink_auth_user', JSON.stringify(userData));
      localStorage.setItem('medilink_auth_expiry', expiryTime.toString());

      // Set default Authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return { success: true, user: userData };
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

      const { token: newToken, user: userData2 } = response.data;

      // Decode JWT to get expiry
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      const expiryTime = payload.exp * 1000;

      // Save to state
      setToken(newToken);
      setUser(userData2);

      // Save to localStorage with expiry from JWT
      localStorage.setItem('medilink_auth_token', newToken);
      localStorage.setItem('medilink_auth_user', JSON.stringify(userData2));
      localStorage.setItem('medilink_auth_expiry', expiryTime.toString());

      // Set Authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return { success: true, user: userData2 };
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

      const { token: newToken, user: userData } = response.data;

      // Decode JWT to get expiry
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      const expiryTime = payload.exp * 1000;

      setToken(newToken);
      setUser(userData);

      localStorage.setItem('medilink_auth_token', newToken);
      localStorage.setItem('medilink_auth_user', JSON.stringify(userData));
      localStorage.setItem('medilink_auth_expiry', expiryTime.toString());

      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return { success: true, user: userData };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Doctor registration failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
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

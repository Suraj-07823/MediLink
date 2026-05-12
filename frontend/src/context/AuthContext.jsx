import React, { createContext, useContext, useState, useEffect } from 'react';
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
  
  // State: error messages
  const [error, setError] = useState(null);

  // On app load, check if user was previously logged in (token in localStorage)
  useEffect(() => {
    const savedToken = localStorage.getItem('medilink_auth_token');
    const savedUser = localStorage.getItem('medilink_auth_user');
    const tokenExpiry = localStorage.getItem('medilink_auth_expiry');
    
    if (savedToken && savedUser && tokenExpiry) {
      const now = Date.now();
      if (now < parseInt(tokenExpiry)) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Set default Authorization header for all axios requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      } else {
        // Token expired, clean up
        localStorage.removeItem('medilink_auth_token');
        localStorage.removeItem('medilink_auth_user');
        localStorage.removeItem('medilink_auth_expiry');
      }
    }
  }, []);

  // ========== LOGIN FUNCTION ==========
  // POST request to /api/auth/login with email and password
  // Returns: token and user object
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        email,
        password
      });

      const { token: newToken, user: userData } = response.data;

      // Save to state
      setToken(newToken);
      setUser(userData);

      // Save to localStorage with expiry (12 hours from now)
      const expiryTime = Date.now() + (12 * 60 * 60 * 1000); // 12 hours
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

      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, userData);

      const { token: newToken, user: userData2 } = response.data;

      // Save to state
      setToken(newToken);
      setUser(userData2);

      // Save to localStorage with expiry
      const expiryTime = Date.now() + (12 * 60 * 60 * 1000); // 12 hours
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
        `${import.meta.env.VITE_API_BASE_URL}/auth/register-doctor`,
        doctorData
      );

      const { token: newToken, user: userData } = response.data;

      setToken(newToken);
      setUser(userData);

      const expiryTime = Date.now() + (12 * 60 * 60 * 1000); // 12 hours
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

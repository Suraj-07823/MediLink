import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      // Call login function from AuthContext
      const response = await login(email, password);

      if (response.success) {
        // Login successful
        const user = response.user;
        
        // Redirect based on role
        if (user.role === 'patient') {
          navigate('/patient/dashboard');
        } else if (user.role === 'doctor') {
          if (user.doctorStatus === 'approved') {
            navigate('/doctor/dashboard');
          } else {
            toast.error(`Your doctor profile is ${user.doctorStatus}. Please wait for admin approval.`);
            navigate('/');
          }
        } else if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          // Fallback for unknown roles
          console.warn('Unknown user role:', user.role);
          toast.error('Login successful, but unable to determine dashboard. Please contact support.');
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('An unexpected error occurred during login. Please try again.');
    }
    // Error is already set by login function and displayed below
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        {/* Header */}
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome Back</h1>
        <p className="text-slate-600 mb-8">Log in to access MediLink</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              aria-describedby={error ? "login-error" : undefined}
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
            />
          </div>

          {/* Password input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              aria-describedby={error ? "login-error" : undefined}
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
            />
          </div>

          {/* Error message */}
          {error && (
            <div id="login-error" className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-2xl font-semibold hover:bg-slate-700 disabled:bg-slate-400 transition duration-200"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-300"></div>
          <span className="text-slate-500 text-sm">or</span>
          <div className="flex-1 h-px bg-slate-300"></div>
        </div>

        {/* Registration link */}
        <p className="text-center text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-slate-900 font-semibold hover:underline">
            Create one
          </Link>
        </p>

        {/* Demo info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-200">
          <p className="text-sm text-blue-900 font-medium">Demo Credentials:</p>
          <p className="text-xs text-blue-800 mt-2">Email: demo@medilink.com</p>
          <p className="text-xs text-blue-800">Password: demo123</p>
        </div>
      </div>
    </div>
  );
}

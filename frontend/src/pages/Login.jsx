import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

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
            navigate('/doctor/pending');   // pending page will display the status message
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
          <Input id="email" label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

          {error && (
            <div id="login-error" className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
              ⚠️ {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</Button>
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

        
      </div>
    </div>
  );
}

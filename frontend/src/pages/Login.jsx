import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await login(email, password);

      if (response.success) {
        const user = response.user;
        
        if (user.role === 'patient') {
          navigate('/patient/dashboard');
        } else if (user.role === 'doctor') {
          navigate(user.doctorStatus === 'approved' ? '/doctor/dashboard' : '/doctor/pending');
        } else if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          console.warn('Unknown user role:', user.role);
          toast.error('Login successful, but unable to determine dashboard.');
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('An unexpected error occurred during login.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center">
          <Link to="/" className="text-base font-bold text-slate-900 hover:text-slate-600 transition-colors">
            ← Back
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left — messaging */}
          <div className="hidden lg:block">
            <h1 className="text-4xl font-bold text-slate-900 leading-tight">
              Welcome<br />back to<br />MediLink
            </h1>
            <p className="mt-5 text-lg text-slate-500 leading-relaxed">
              Sign in with your email to access your appointments, prescriptions, and medical records.
            </p>
            <div className="mt-12 space-y-4">
              <div className="flex gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Manage appointments</p>
                  <p className="text-xs text-slate-500">Book, reschedule, or cancel anytime</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">💊</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Digital prescriptions</p>
                  <p className="text-xs text-slate-500">Access prescriptions from your doctors instantly</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">📋</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Medical records</p>
                  <p className="text-xs text-slate-500">All your health info in one secure place</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div>
            <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Sign in</h2>
              <p className="text-sm text-slate-500 mb-6">Enter your email and password to continue</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  id="email"
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
                <Input
                  id="password"
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    ⚠️ {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  role="patient"
                  size="lg"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

              {/* Link to register */}
              <p className="mt-6 text-center text-sm text-slate-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  Create one
                </Link>
              </p>
            </div>

            {/* Demo info */}
            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
              <p className="font-semibold mb-2">Demo credentials</p>
              <p className="text-xs leading-relaxed">
                <span className="font-mono">demo@test.com</span> / <span className="font-mono">demo123</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

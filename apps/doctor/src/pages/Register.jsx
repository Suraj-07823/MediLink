import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Register() {
  const navigate = useNavigate();
  const { register, registerDoctor, loading, error } = useAuth();
  const isFirstRender = useRef(true);

  const [selectedRole, setSelectedRole] = useState('patient');
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    dateOfBirth: '', gender: '', bloodGroup: '',
    speciality: '', qualification: '', experience: '', regNumber: '',
    consultationFee: '', clinicName: '', clinicArea: '', clinicPincode: '', about: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setFormData({
      name: '', email: '', phone: '', password: '', confirmPassword: '',
      dateOfBirth: '', gender: '', bloodGroup: '',
      speciality: '', qualification: '', experience: '', regNumber: '',
      consultationFee: '', clinicName: '', clinicArea: '', clinicPincode: '', about: ''
    });
  }, [selectedRole]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    return strength;
  };

  const getPasswordRequirements = () => {
    const password = formData.password;
    return [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
      { label: 'One lowercase letter', met: /[a-z]/.test(password) },
      { label: 'One number', met: /\d/.test(password) },
      { label: 'One special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];
  };

  const validatePassword = (password) => {
    const reqs = getPasswordRequirements();
    return reqs.every(r => r.met) ? null : 'Password does not meet requirements';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error('Please fill all required fields');
      return;
    }

    if (selectedRole === 'patient') {
      const response = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'patient',
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        bloodGroup: formData.bloodGroup || null
      });

      if (response && response.success) {
        toast.success('Registration successful! Welcome to MediLink.');
        navigate('/patient/dashboard');
      }
    } else if (selectedRole === 'doctor') {
      if (!formData.speciality || !formData.qualification || !formData.regNumber) {
        toast.error('Please fill all required doctor fields');
        return;
      }

      const response = await registerDoctor({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        speciality: formData.speciality,
        qualification: formData.qualification,
        experience: parseInt(formData.experience) || 0,
        regNumber: formData.regNumber,
        consultationFee: parseInt(formData.consultationFee) || 500,
        clinicName: formData.clinicName,
        clinicAddress: { area: formData.clinicArea, pincode: formData.clinicPincode },
        about: formData.about
      });

      if (response && response.success) {
        toast.success('Registration successful! Awaiting admin approval.');
        navigate('/doctor/pending');
      }
    }
  };

  const patientRole = selectedRole === 'patient';
  const requirements = getPasswordRequirements();

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

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        
        {/* Role selector */}
        <div className="mb-8">
          <p className="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wide">Choose account type</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { role: 'patient', icon: '🏥', label: 'Patient' },
              { role: 'doctor',  icon: '👨‍⚕️', label: 'Doctor' },
            ].map(({ role, icon, label }) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`py-4 px-4 rounded-2xl font-semibold border-2 transition-all ${
                  selectedRole === role
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="text-2xl block mb-1">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            {patientRole ? 'Create patient account' : 'Apply as doctor'}
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            {patientRole
              ? 'Book appointments and manage your health'
              : 'Register as a doctor and start accepting patients'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Common fields */}
            <Input
              name="name"
              label="Full name *"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <Input
              name="email"
              type="email"
              label="Email address *"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              name="phone"
              type="tel"
              label="Phone number *"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            {/* Patient fields */}
            {patientRole && (
              <>
                <Input
                  name="dateOfBirth"
                  type="date"
                  label="Date of birth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Blood group</label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">Select blood group</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Doctor fields */}
            {!patientRole && (
              <>
                <Input
                  name="speciality"
                  label="Speciality *"
                  placeholder="e.g., Cardiology, General Practice"
                  value={formData.speciality}
                  onChange={handleChange}
                  required
                />

                <Input
                  name="qualification"
                  label="Qualification *"
                  placeholder="e.g., MBBS, MD"
                  value={formData.qualification}
                  onChange={handleChange}
                  required
                />

                <Input
                  name="regNumber"
                  label="Medical registration number *"
                  placeholder="e.g., 123456"
                  value={formData.regNumber}
                  onChange={handleChange}
                  required
                />

                <Input
                  name="experience"
                  type="number"
                  label="Years of experience"
                  placeholder="0"
                  value={formData.experience}
                  onChange={handleChange}
                  min="0"
                />

                <Input
                  name="clinicName"
                  label="Clinic name"
                  placeholder="Your clinic name"
                  value={formData.clinicName}
                  onChange={handleChange}
                />

                <Input
                  name="clinicArea"
                  label="Clinic area"
                  placeholder="e.g., Dharampeth, Nagpur"
                  value={formData.clinicArea}
                  onChange={handleChange}
                />

                <Input
                  name="clinicPincode"
                  label="Clinic pincode"
                  placeholder="440010"
                  value={formData.clinicPincode}
                  onChange={handleChange}
                />
              </>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Password *</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Password strength indicator */}
              {formData.password && (
                <div className="mt-3 space-y-2">
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        passwordStrength <= 2 ? 'bg-red-500' :
                        passwordStrength <= 3 ? 'bg-amber-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                  <div className="space-y-1">
                    {requirements.map(({ label, met }) => (
                      <p
                        key={label}
                        className={`text-xs flex items-center gap-2 ${
                          met ? 'text-green-600' : 'text-slate-500'
                        }`}
                      >
                        <span>{met ? '✓' : '○'}</span> {label}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Input
              name="confirmPassword"
              type="password"
              label="Confirm password *"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
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
              role={patientRole ? 'patient' : 'doctor'}
              size="lg"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          {/* Link to login */}
          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <p>By registering, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </main>
    </div>
  );
}

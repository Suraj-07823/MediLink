import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register, registerDoctor, loading, error } = useAuth();

  // Form state
  const [selectedRole, setSelectedRole] = useState('patient'); // 'patient' or 'doctor'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Patient fields
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    // Doctor fields
    speciality: '',
    qualification: '',
    experience: '',
    regNumber: '',
    consultationFee: '',
    clinicName: '',
    clinicArea: '',
    clinicPincode: '',
    about: ''
  });

  // Clear form when role changes
  useEffect(() => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      // Patient fields
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      // Doctor fields
      speciality: '',
      qualification: '',
      experience: '',
      regNumber: '',
      consultationFee: '',
      clinicName: '',
      clinicArea: '',
      clinicPincode: '',
      about: ''
    });
  }, [selectedRole]);

// This function runs every time user types in any input field
// e.target.name = which field (email, phone, name etc)
// e.target.value = what the user typed
const handleChange = (e) => {
  setFormData(prev => ({
    ...prev,
    [e.target.name]: e.target.value
  }));
};

  // Password strength validation
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return 'Password must be at least 8 characters long';
    }
    if (!hasUpperCase) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!hasLowerCase) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!hasNumbers) {
      return 'Password must contain at least one number';
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character';
    }
    return null; // Valid password
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      alert(passwordError);
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      alert('Please fill all required fields');
      return;
    }

    if (selectedRole === 'patient') {
      // Patient registration
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

      if (response.success) {
        alert('Registration successful! Welcome to MediLink.');
        navigate('/');
      }
    } else if (selectedRole === 'doctor') {
      // Doctor registration
      if (!formData.speciality || !formData.qualification || !formData.regNumber) {
        alert('Please fill all doctor fields');
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
        clinicAddress: {
          area: formData.clinicArea,
          city: 'Nagpur',
          pincode: formData.clinicPincode
        },
        about: formData.about
      });

      if (response.success) {
        alert('Registration successful! Awaiting admin approval.');
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h1>
        <p className="text-slate-600 mb-8">Join MediLink to get started</p>

        {/* Role Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-700 mb-3">I am a:</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedRole('patient')}
              className={`py-3 px-4 rounded-2xl font-medium transition ${
                selectedRole === 'patient'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Patient
            </button>
            <button
              onClick={() => setSelectedRole('doctor')}
              className={`py-3 px-4 rounded-2xl font-medium transition ${
                selectedRole === 'doctor'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Doctor
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Common fields */}
          <input
            type="text"
            name="name"
            placeholder="Full name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone (10 digits)"
            value={formData.phone}
            onChange={handleChange}
            required
            pattern="\d{10}"
            className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />

          {/* Patient-specific fields */}
          {selectedRole === 'patient' && (
            <>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="">Select blood group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </>
          )}

          {/* Doctor-specific fields */}
          {selectedRole === 'doctor' && (
            <>
              <input
                type="text"
                name="speciality"
                placeholder="Speciality (e.g., Cardiology)"
                value={formData.speciality}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />

              <input
                type="text"
                name="qualification"
                placeholder="Qualification (e.g., MBBS)"
                value={formData.qualification}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />

              <input
                type="number"
                name="experience"
                placeholder="Years of experience"
                value={formData.experience}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />

              <input
                type="text"
                name="regNumber"
                placeholder="Medical registration number"
                value={formData.regNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />

              <input
                type="number"
                name="consultationFee"
                placeholder="Consultation fee (₹)"
                value={formData.consultationFee}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />

              <input
                type="text"
                name="clinicName"
                placeholder="Clinic name"
                value={formData.clinicName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />

              <input
                type="text"
                name="clinicArea"
                placeholder="Clinic area"
                value={formData.clinicArea}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />

              <input
                type="text"
                name="clinicPincode"
                placeholder="Clinic pincode"
                value={formData.clinicPincode}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />

              <textarea
                name="about"
                placeholder="About you (bio)"
                value={formData.about}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
              />
            </>
          )}

          {/* Password fields (common) */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />

          {/* Error message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-2xl font-semibold hover:bg-slate-700 disabled:bg-slate-400 transition"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-slate-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-slate-900 font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

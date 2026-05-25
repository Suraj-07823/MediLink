export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        medilink: {
          patient: '#2563EB',
          patientLight: '#EFF6FF',
          doctor: '#16A34A',
          doctorLight: '#F0FDF4',
          admin: '#7C3AED',
        }
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem'
      }
    },
  },
  plugins: [],
};

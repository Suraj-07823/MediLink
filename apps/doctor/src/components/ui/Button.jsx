export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  role = 'patient',
  className = '',
  disabled = false,
  loading = false,
  ...props
}) {
  const roleColor = {
    patient: { primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500', secondary: 'border-blue-200 text-blue-700 hover:bg-blue-50' },
    doctor:  { primary: 'bg-green-600 hover:bg-green-700 focus:ring-green-500', secondary: 'border-green-200 text-green-700 hover:bg-green-50' },
    admin:   { primary: 'bg-violet-600 hover:bg-violet-700 focus:ring-violet-500', secondary: 'border-violet-200 text-violet-700 hover:bg-violet-50' },
  }[role] || { primary: 'bg-slate-900 hover:bg-slate-800 focus:ring-slate-500', secondary: 'border-slate-200 text-slate-700 hover:bg-slate-50' };

  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizes = {
    sm: 'px-3.5 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variants = {
    primary:   `${roleColor.primary} text-white`,
    secondary: `bg-white border ${roleColor.secondary}`,
    danger:    'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    ghost:     'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}

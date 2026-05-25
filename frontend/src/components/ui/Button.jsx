export default function Button({ children, variant = 'primary', size = 'md', className = '', disabled = false, ...props }) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-2xl transition';
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50',
    secondary: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50'
  };

  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} disabled={disabled} {...props}>
      {children}
    </button>
  );
}

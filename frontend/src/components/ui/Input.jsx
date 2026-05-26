export default function Input({
  label,
  id,
  type = 'text',
  error = '',
  hint = '',
  required = false,
  className = '',
  ...props
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400
          focus:outline-none focus:ring-2 focus:border-transparent transition
          ${error ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-blue-500'}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

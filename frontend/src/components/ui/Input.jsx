export default function Input({ label, id, type = 'text', className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="text-sm font-medium text-slate-700 mb-2 block">{label}</span>}
      <input id={id} type={type} className={`mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 ${className}`} {...props} />
    </label>
  );
}

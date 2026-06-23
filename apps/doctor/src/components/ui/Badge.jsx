export default function Badge({ children, tone = 'indigo', className = '' }) {
  const tones = {
    indigo: 'bg-indigo-100 text-indigo-700',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`rounded-full px-3 py-1 text-sm font-medium ${tones[tone] || tones.indigo} ${className}`}>{children}</span>
  );
}

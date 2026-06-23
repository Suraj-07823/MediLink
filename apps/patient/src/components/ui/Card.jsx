export default function Card({ children, className = '' }) {
  return (
    <div className={`ml-card ${className}`}>
      {children}
    </div>
  );
}

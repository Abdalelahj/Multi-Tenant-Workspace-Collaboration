export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-700 border-t-indigo-500 ${className}`}
      style={{ width: 20, height: 20 }}
      role="status"
      aria-label="Loading"
    />
  );
}

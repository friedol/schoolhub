import { Loader2 } from 'lucide-react';

export function Spinner({
  className = '',
  size = 24,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Loader2
      className={`animate-spin ${className}`}
      size={size}
    />
  );
}

export default Spinner;

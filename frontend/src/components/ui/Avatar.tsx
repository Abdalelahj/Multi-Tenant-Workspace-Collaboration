import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  online?: boolean;
}

const sizeMap = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
};

export function Avatar({ name, color = '#6366f1', size = 'md', online }: AvatarProps) {
  return (
    <div className="relative inline-flex shrink-0">
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-semibold text-white select-none',
          sizeMap[size],
        )}
        style={{ backgroundColor: color }}
        title={name}
      >
        {getInitials(name)}
      </div>
      {online !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-gray-900',
            online ? 'bg-emerald-400' : 'bg-gray-500',
          )}
        />
      )}
    </div>
  );
}

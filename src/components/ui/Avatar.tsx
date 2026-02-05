import { cn } from '@/utils/cn';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initials = name ? getInitials(name) : '?';

  if (src) {
    return (
      <img src={src} alt={name || 'Avatar'} className={cn('rounded-full object-cover', sizes[size], className)} />
    );
  }

  return (
    <div className={cn('rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium', sizes[size], className)}>
      {initials}
    </div>
  );
}

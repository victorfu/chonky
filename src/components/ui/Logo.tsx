import { cn } from '@/utils/cn';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
};

export function Logo({ size = 'md', className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn(sizes[size], className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="6" className="fill-accent" />
      <path
        d="M8 10h16M8 16h12M8 22h8"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

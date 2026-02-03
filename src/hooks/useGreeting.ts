import { useMemo } from 'react';

export function useGreeting(displayName?: string): string {
  return useMemo(() => {
    const hour = new Date().getHours();
    let greeting: string;

    if (hour >= 5 && hour < 12) {
      greeting = 'Good morning';
    } else if (hour >= 12 && hour < 18) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }

    return displayName ? `${greeting}, ${displayName}` : greeting;
  }, [displayName]);
}

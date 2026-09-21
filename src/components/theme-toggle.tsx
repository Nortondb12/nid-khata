import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

/**
 * Light-only theme control.
 *
 * The product ships a single light theme, so this control no longer switches
 * between light and dark. It keeps the same visual footprint and accessible
 * label so existing layouts stay unchanged, and it is a no-op on click.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="লাইট থিম সক্রিয়"
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
          className
        )}
      >
        <span className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label="লাইট থিম সক্রিয়"
      aria-pressed="true"
      title="লাইট থিম"
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground transition-all duration-300 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
    >
      <span className="relative h-4 w-4">
        <Sun className="absolute inset-0 h-4 w-4 rotate-0 scale-100 transition-transform duration-300" />
        <Moon className="absolute inset-0 h-4 w-4 -rotate-90 scale-0 opacity-0 transition-all duration-300" />
      </span>
    </button>
  );
}

export default ThemeToggle;

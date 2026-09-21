import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

/**
 * Light-only build: the theme toggle is intentionally a no-op.
 * Dark mode has been removed from the design system, so this component
 * renders nothing while keeping the export stable for existing call sites.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  void className;
  return null;
}

import { clsx } from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'terra';
};

export function Button({ className, variant = 'secondary', ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        // Base — min 44px touch target height, accessible focus ring
        'inline-flex items-center justify-center min-h-[44px] rounded-lg px-6 py-2.5 text-sm font-semibold',
        'transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#2C5F2D] focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',

        // Primary — filled emerald (use sparingly: 1 per page)
        variant === 'primary' &&
          'bg-[#2C5F2D] text-white hover:bg-[#245224] active:opacity-90',

        // Secondary — outline emerald (default for most buttons)
        variant === 'secondary' &&
          'border-2 border-[#2C5F2D] text-[#2C5F2D] dark:border-[#4A8F4B] dark:text-[#4A8F4B] bg-transparent hover:bg-[#2C5F2D]/5 dark:hover:bg-[#4A8F4B]/10 active:opacity-80',

        // Ghost — text only
        variant === 'ghost' &&
          'text-[#2C5F2D] dark:text-[#4A8F4B] bg-transparent hover:bg-[#9CAF88]/15 active:opacity-80',

        // Terra — terracotta accent (special CTAs only)
        variant === 'terra' &&
          'bg-[#E07A5F] text-white hover:bg-[#D06A4F] active:opacity-90',

        className
      )}
      {...props}
    />
  );
}

import { clsx } from 'clsx';
import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={clsx(
        // Base — soft beige bg, no drop shadow, emerald focus ring
        'w-full rounded-lg border border-[#D4E4CC]',
        'bg-[#F0EAD6] dark:bg-[#2A3D2A]',
        'px-4 py-3 text-base text-[#1A3B1A] dark:text-[#E8F0E8]',
        'placeholder:text-[#8B9E6B] dark:placeholder:text-[#7A987A]',
        'outline-none transition-colors duration-200',
        'focus:border-[#2C5F2D] focus:ring-2 focus:ring-[#2C5F2D]/30',
        'min-h-[44px]', // touch target
        className
      )}
      {...props}
    />
  );
}

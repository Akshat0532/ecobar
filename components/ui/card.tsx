import { clsx } from 'clsx';
import type { HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'surface' | 'outline';
};

export function Card({ className, variant = 'surface', ...props }: CardProps) {
  return (
    <div
      className={clsx(
        // Base — white bg, 8px radius, sage top border accent, no hover lift
        'rounded-lg p-6 md:p-8',
        'bg-white dark:bg-[#1E331E]',
        'border-t-2 border-t-[#9CAF88] dark:border-t-[#7A9E68]',
        'shadow-[0_1px_8px_rgba(44,95,45,0.06)]',
        variant === 'outline' &&
          'border border-[#D4E4CC] dark:border-[#2E4E2E] border-t-2 border-t-[#9CAF88]',
        className
      )}
      {...props}
    />
  );
}

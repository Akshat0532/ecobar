import { clsx } from 'clsx';
import type { HTMLAttributes } from 'react';

type DialogProps = HTMLAttributes<HTMLDivElement> & {
  open: boolean;
  onClose: () => void;
};

export function Dialog({ className, open, onClose, children, ...props }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xl">
      <div
        className={clsx(
          'relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white dark:bg-[#1C1C1E] p-6 shadow-apple-lg',
          className
        )}
        {...props}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

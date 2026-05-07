'use client';

import { cloneElement, createContext, useContext, type ReactElement, type ReactNode } from 'react';

type SheetContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const SheetContext = createContext<SheetContextValue | null>(null);

export function Sheet({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return <SheetContext.Provider value={{ open, onOpenChange }}>{children}</SheetContext.Provider>;
}

export function SheetTrigger({ children }: { children: ReactElement }) {
  const context = useContext(SheetContext);

  if (!context) {
    return null;
  }

  return cloneElement(children, {
    onClick: () => context.onOpenChange(!context.open),
  });
}

export function SheetContent({ children }: { children: ReactNode }) {
  const context = useContext(SheetContext);

  if (!context?.open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        type="button"
        aria-label="Close menu"
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={() => context.onOpenChange(false)}
      />
      <div className="relative ml-auto flex h-full w-80 flex-col overflow-auto bg-white dark:bg-[#1C1C1E] p-6 shadow-apple-lg">
        {children}
      </div>
    </div>
  );
}

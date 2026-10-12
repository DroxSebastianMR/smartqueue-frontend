import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          'h-12 w-full appearance-none rounded-xl border border-white/10 bg-white/[.055] px-4 pr-10 text-sm font-medium text-zinc-100 outline-none transition focus:border-sky-200/60 focus:ring-4 focus:ring-sky-200/10',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
    </div>
  );
}

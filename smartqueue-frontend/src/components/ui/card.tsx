import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-2xl border border-white/10 bg-zinc-950/70 shadow-2xl shadow-black/20 backdrop-blur', className)} {...props} />;
}


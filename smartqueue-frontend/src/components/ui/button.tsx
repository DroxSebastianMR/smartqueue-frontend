import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-zinc-100 px-5 py-3 text-zinc-950 shadow-lg shadow-black/20 hover:bg-white',
        outline: 'border border-white/15 bg-white/5 px-5 py-3 text-white hover:bg-white/10',
        ghost: 'px-4 py-2 text-zinc-300 hover:bg-white/8 hover:text-white',
      },
      size: { default: '', lg: 'px-7 py-4 text-base', icon: 'size-10 p-0' },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export function Button({ className, variant, size, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}


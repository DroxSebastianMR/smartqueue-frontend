import type { InputHTMLAttributes } from 'react';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

export function AuthInput({ id, label, error, className = '', ...props }: AuthInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-zinc-200">{label}</label>
      <input id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className={`mt-2 w-full rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-sky-100/50 ${className}`} {...props} />
      {error && <p id={`${id}-error`} className="mt-1.5 text-xs text-red-200">{error}</p>}
    </div>
  );
}

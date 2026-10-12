import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@/app/providers/auth/use-auth';
import { PATHS } from '@/app/router/constants/paths';
import { loginSchema } from '@/features/auth/schemas/login.schema';

type LoginErrors = Partial<Record<'email' | 'password' | 'form', string>>;

export function useLoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function clearError(field: keyof LoginErrors) { setErrors((current) => ({ ...current, [field]: undefined, form: undefined })); }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const next: LoginErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === 'email' || field === 'password') next[field] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      await login(parsed.data);
      const from = (location.state as { from?: string } | null)?.from;
      const safeFrom = from?.startsWith('/') && !from.startsWith('//') ? from : PATHS.HOME;
      navigate(safeFrom, { replace: true });
    } catch (cause) {
      setErrors({ form: cause instanceof Error ? cause.message : 'No se pudo iniciar sesión' });
    } finally { setIsSubmitting(false); }
  }

  return { email, password, showPassword, errors, isSubmitting, setEmail, setPassword, setShowPassword, clearError, handleSubmit };
}

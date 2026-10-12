import { ArrowRight, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PATHS } from '@/app/router/constants/paths';
import { Button } from '@/components/ui/button';
import { AuthInput } from '@/features/auth/components/auth-input';
import { useLoginForm } from '@/features/auth/hooks/use-login-form';

export function LoginForm() {
  const { email, password, showPassword, errors, isSubmitting, setEmail, setPassword, setShowPassword, clearError, handleSubmit } = useLoginForm();
  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
      <AuthInput id="login-email" label="Correo electrónico" type="email" inputMode="email" autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); clearError('email'); }} error={errors.email} placeholder="tu@correo.com" />
      <div>
        <AuthInput id="login-password" label="Contraseña" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.target.value); clearError('password'); }} error={errors.password} placeholder="••••••••" className="pr-12" />
        <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} className="relative -mt-11 mr-3 flex h-8 w-8 items-center justify-center justify-self-end text-zinc-400 hover:text-white">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
      </div>
      {errors.form && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{errors.form}</p>}
      <div className="flex justify-end"><Link to={PATHS.AUTH.RECOVER} className="text-sm text-sky-100/80 hover:text-white">¿Olvidaste tu contraseña?</Link></div>
      <Button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-white py-6 text-zinc-950 hover:bg-zinc-200">{isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowRight className="size-4" />} Continuar</Button>
    </form>
  );
}

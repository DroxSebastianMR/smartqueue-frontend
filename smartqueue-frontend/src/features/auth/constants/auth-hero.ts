import { PATHS } from '@/app/router/constants/paths';

export function getAuthHero(pathname: string) {
  if (pathname === PATHS.AUTH.RECOVER) return { eyebrow: 'Recupera tu acceso', title: 'Volvamos a encontrarnos.', description: 'Tu próxima experiencia en el cine te espera.' };
  if (pathname === PATHS.AUTH.REGISTER) return { eyebrow: 'Únete a Cinetrux', title: 'Más cerca de la pantalla.', description: 'Prepara tu cuenta para tus próximas funciones.' };
  return { eyebrow: 'Tu próxima función', title: 'El cine empieza aquí.', description: 'Ingresa para explorar funciones, reservar butacas y seguir tu lugar en la fila.' };
}

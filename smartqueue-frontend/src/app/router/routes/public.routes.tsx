import type { RouteObject } from 'react-router-dom';
import { PATHS } from '@/app/router/constants/paths';
import { PublicRoute } from '@/app/router/guards/public-route';
import { LoginPage } from '@/features/auth/pages/login-page';
import { RecoverPage } from '@/features/auth/pages/recover-page';
import { RegisterPage } from '@/features/auth/pages/register-page';
import { ForbiddenPage } from '@/features/auth/pages/forbidden-page';
import { HomePage } from '@/features/home/pages/home-page';
import { UpcomingMoviesPage } from '@/features/movies/pages/upcoming-movies-page';
import { MovieDetailPage } from '@/features/movies/pages/movie-detail-page';
import { LandingLayout } from '@/layouts/landing/landing-layout';
import { AuthLayout } from '@/layouts/auth/auth-layout';

export const publicRoutes: RouteObject[] = [
  { element: <LandingLayout />, children: [
    { path: PATHS.HOME, element: <HomePage /> },
    { path: PATHS.UPCOMING, element: <UpcomingMoviesPage /> },
    { path: PATHS.MOVIE_DETAIL, element: <MovieDetailPage /> },
    { path: PATHS.FORBIDDEN, element: <ForbiddenPage /> },
  ] },
  { element: <PublicRoute />, children: [{ element: <AuthLayout />, children: [
    { path: PATHS.AUTH.LOGIN, element: <LoginPage /> },
    { path: PATHS.AUTH.RECOVER, element: <RecoverPage /> },
    { path: PATHS.AUTH.REGISTER, element: <RegisterPage /> },
  ] }] },
];

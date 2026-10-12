import type { Movie } from '@/features/events/models/movie.model';

export const HOME_MOVIES: Movie[] = [
  { id: 'horizonte', title: 'Horizonte', genre: 'Ciencia ficción · Drama', duration: '2h 12m', rating: '+13', releaseTag: 'Recomendado', palette: 'from-[#071016] via-[#16333f] to-[#8fc9dc]', poster: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=900&q=88' },
  { id: 'odyssey', title: 'La Odisea', genre: 'Aventura · Drama', duration: '2h 16m', rating: 'APT', releaseTag: 'Estreno', palette: 'from-[#061a2a] via-[#315366] to-[#b2cbd3]', poster: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=88' },
  { id: 'zero', title: 'Zona Cero', genre: 'Suspenso · Acción', duration: '1h 57m', rating: '+14', palette: 'from-[#0b0b0d] via-[#3d4249] to-[#aeb8c3]', poster: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd4298?auto=format&fit=crop&w=900&q=88' },
  { id: 'heart', title: 'La última luz', genre: 'Drama · Misterio', duration: '2h 04m', rating: 'APT', palette: 'from-[#091319] via-[#3d5d6b] to-[#c6d9dc]', poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=900&q=88' },
  { id: 'family', title: 'Ecos del mar', genre: 'Aventura · Familiar', duration: '1h 44m', rating: 'APT', palette: 'from-[#0b1720] via-[#34687e] to-[#c7e8ef]', poster: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=88' },
];

export const UPCOMING_MOVIES: Movie[] = [
  { id: 'avengers-doomsday', title: 'Avengers: Doomsday', genre: 'Acción · Ciencia ficción', duration: 'Próximamente', rating: '+14', releaseTag: 'Muy pronto', palette: 'from-[#07100a] via-[#1e3825] to-[#99c49a]', poster: 'https://image.tmdb.org/t/p/original/jzPwsojjFStf5lR5Nm07w2hH56G.jpg' },
  { id: 'signal', title: 'La señal', genre: 'Ciencia ficción', duration: 'Próximamente', rating: '+13', releaseTag: 'Octubre', palette: 'from-[#071014] via-[#21434c] to-[#9ce7ef]', poster: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=88' },
  { id: 'north', title: 'Norte', genre: 'Aventura', duration: 'Próximamente', rating: 'APT', releaseTag: 'Noviembre', palette: 'from-[#0b1116] via-[#405661] to-[#d0e2e8]', poster: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=88' },
  { id: 'neon', title: 'Neón', genre: 'Suspenso', duration: 'Próximamente', rating: '+14', releaseTag: 'Diciembre', palette: 'from-[#09090c] via-[#29343e] to-[#8fc7e8]', poster: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=88' },
  { id: 'orbit', title: 'Órbita', genre: 'Drama', duration: 'Próximamente', rating: '+13', releaseTag: 'Muy pronto', palette: 'from-[#05080d] via-[#233f5b] to-[#a5cfee]', poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=88' },
];

export const CITIES = ['Lima', 'Arequipa', 'Trujillo', 'Cusco', 'Piura'];
export const CINEMAS = ['Cinetrux Centro', 'Cinetrux San Miguel', 'Cinetrux Primavera'];

import type { Movie } from '@/features/events/models/movie.model';

export const HOME_MOVIES: Movie[] = [
  { id: 'doomsday', title: 'Doomsday', genre: 'Acción · Ciencia ficción', duration: '2h 38m', rating: '+14', releaseTag: 'Preventa', palette: 'from-[#541522] via-[#af1838] to-[#081629]' },
  { id: 'odyssey', title: 'La Odisea', genre: 'Aventura · Drama', duration: '2h 16m', rating: 'APT', releaseTag: 'Estreno', palette: 'from-[#062d46] via-[#08738c] to-[#c79b5c]' },
  { id: 'zero', title: 'Zona Cero', genre: 'Suspenso · Acción', duration: '1h 57m', rating: '+14', palette: 'from-[#161b25] via-[#3f4854] to-[#c76d32]' },
  { id: 'heart', title: 'El corazón de la bestia', genre: 'Fantasía · Romance', duration: '2h 04m', rating: 'APT', palette: 'from-[#17293d] via-[#526d66] to-[#d5bd7a]' },
  { id: 'family', title: 'Álbum de familia', genre: 'Comedia · Familiar', duration: '1h 44m', rating: 'APT', palette: 'from-[#7d2947] via-[#d86f69] to-[#ffd79b]' },
];

export const CITIES = ['Lima', 'Arequipa', 'Trujillo', 'Cusco', 'Piura'];
export const CINEMAS = ['SmartQueue Centro', 'SmartQueue San Miguel', 'SmartQueue Primavera'];

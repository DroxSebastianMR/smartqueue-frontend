import type { Movie } from '@/features/events/models/movie.model';

export const HOME_MOVIES: Movie[] = [
  { id: 'avengers-doomsday-current', title: 'Avengers: Doomsday', genre: 'Acción · Ciencia ficción', duration: '17 dic', rating: 'TBC', format: 'IV · 3D', releaseTag: 'Preventa', palette: 'from-[#07100a] via-[#1e3825] to-[#99c49a]', poster: 'https://image.tmdb.org/t/p/original/jzPwsojjFStf5lR5Nm07w2hH56G.jpg' },
  { id: 'spider-man-brand-new-day', title: 'Spider-Man: Un nuevo día', genre: 'Acción · Aventura', duration: '2h 25m', rating: '+13', format: '2D · XD', releaseTag: 'En cartelera', palette: 'from-[#100a0b] via-[#61232b] to-[#b8cbd8]', poster: 'https://www.impawards.com/2026/posters/spiderman_brand_new_day_ver17_xlg.jpg' },
  { id: 'blue-lock', title: 'Blue Lock', genre: 'Anime · Deporte', duration: '2h 08m', rating: '+14', format: '2D', releaseTag: 'Estreno', palette: 'from-[#06121e] via-[#124a75] to-[#75c8f5]', poster: 'https://m.media-amazon.com/images/M/MV5BZDJlNTFkNmItMmM5Zi00YWYxLTg3ODgtYWNkNWJhYWNlYjdjXkEyXkFqcGc%40._V1_.jpg' },
  { id: 'cars-20', title: 'Cars: 20 aniversario', genre: 'Animación · Familiar', duration: '1h 57m', rating: 'APT', format: '2D', releaseTag: 'Evento', palette: 'from-[#100808] via-[#6a1d1d] to-[#e5a340]', poster: 'https://media-cine.entradas.com/images/film/cars-20-aniversario-109127.v17895696256000.jpg' },
  { id: 'magic-tree', title: 'El Árbol Mágico', genre: 'Aventura · Familiar', duration: '1h 50m', rating: 'APT', format: '2D', palette: 'from-[#0e1008] via-[#4a5226] to-[#d2b36b]', poster: 'https://cdn.cinemark.cl/content/posters/HO00015188.jpg' },
];

export const UPCOMING_MOVIES: Movie[] = [
  { id: 'avengers-doomsday', title: 'Avengers: Doomsday', genre: 'Próximo estreno', duration: 'Próximamente', rating: 'TBC', releaseTag: '2026', palette: 'from-[#07100a] via-[#1e3825] to-[#99c49a]', poster: 'https://image.tmdb.org/t/p/original/jzPwsojjFStf5lR5Nm07w2hH56G.jpg' },
  { id: 'street-fighter-2026', title: 'Street Fighter', genre: 'Próximo estreno', duration: 'Próximamente', rating: 'TBC', releaseTag: '2026', palette: 'from-[#101116] via-[#263d54] to-[#8bc2ee]', poster: 'https://cdn.kinocheck.com/i/w%3D1200/9hgzyq4ym3.jpg' },
  { id: 'clayface-2026', title: 'Clayface', genre: 'Próximo estreno', duration: 'Próximamente', rating: 'TBC', releaseTag: '2026', palette: 'from-[#0d0d0f] via-[#3b3d42] to-[#aeb2b8]', poster: 'https://www.impawards.com/2026/posters/clayface_xlg.jpg' },
  { id: 'whalefall-2026', title: 'Whalefall', genre: 'Próximo estreno', duration: 'Próximamente', rating: 'TBC', releaseTag: '2026', palette: 'from-[#061018] via-[#193f58] to-[#84c9e6]', poster: 'https://cdn.moviefone.com/admin-uploads/highlights/images/whalefall-official-teaser-poster_1781031419.webp' },
  { id: 'wildwood-2026', title: 'Wildwood', genre: 'Próximo estreno', duration: 'Próximamente', rating: 'TBC', releaseTag: '2026', palette: 'from-[#09110c] via-[#294932] to-[#a3c79f]', poster: 'https://media2.firstshowing.net/firstshowing/img18/wildwoodfinalpostermainimgb59.jpg' },
  { id: 'sunrise-on-the-reaping', title: 'The Hunger Games: Sunrise on the Reaping', genre: 'Próximo estreno', duration: 'Próximamente', rating: 'TBC', releaseTag: '2026', palette: 'from-[#120d08] via-[#5a3921] to-[#d9ad72]', poster: 'https://www.impawards.com/2026/posters/hunger_games_sunrise_on_the_reaping_xlg.jpg' },
  { id: 'cat-in-the-hat-2026', title: 'The Cat in the Hat', genre: 'Próximo estreno', duration: 'Próximamente', rating: 'TBC', releaseTag: '2026', palette: 'from-[#101018] via-[#3d4168] to-[#b7c9ed]', poster: 'https://www.cinemaclock.com/images/posters/1000x1500/19/the-cat-in-the-hat-2026-orig-poster.jpg' },
  { id: 'the-odyssey-2026', title: 'The Odyssey', genre: 'Próximo estreno', duration: 'Próximamente', rating: 'TBC', releaseTag: '2026', palette: 'from-[#090f14] via-[#263e51] to-[#9fb8c7]', poster: 'https://cdn.posteritati.com/posters/000/000/079/359/the-odyssey-md-web.jpg' },
  { id: 'godzilla-minus-zero', title: 'Godzilla Minus Zero', genre: 'Próximo estreno', duration: 'Próximamente', rating: 'TBC', releaseTag: '2026', palette: 'from-[#0b0d0e] via-[#313a3c] to-[#91a8a7]', poster: 'https://images.squarespace-cdn.com/content/v1/5bbcad0f2727be3646b9fee1/23b248aa-b236-4ecd-a1af-e926ea528e81/IMG_1910.jpeg' },
  { id: 'dune-part-three', title: 'Dune: Part Three', genre: 'Próximo estreno', duration: 'Próximamente', rating: 'TBC', releaseTag: '2026', palette: 'from-[#120d08] via-[#76502f] to-[#dfb271]', poster: 'https://www.impawards.com/2026/posters/dune_part_three_xlg.jpg' },
];

export const CITIES = ['Lima', 'Arequipa', 'Trujillo', 'Cusco', 'Piura'];
export const CINEMAS = ['Cinetrux Centro', 'Cinetrux San Miguel', 'Cinetrux Primavera'];

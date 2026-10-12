import type { Movie } from '@/features/events/models/movie.model';

export const HOME_MOVIES: Movie[] = [
  { id: 'horizonte', title: 'Horizonte', genre: 'Ciencia ficción · Drama', duration: '2h 12m', rating: '+13', releaseTag: 'Recomendado', palette: 'from-[#071016] via-[#16333f] to-[#8fc9dc]', poster: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=900&q=88' },
  { id: 'odyssey', title: 'La Odisea', genre: 'Aventura · Drama', duration: '2h 16m', rating: 'APT', releaseTag: 'Estreno', palette: 'from-[#061a2a] via-[#315366] to-[#b2cbd3]', poster: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=88' },
  { id: 'zero', title: 'Zona Cero', genre: 'Suspenso · Acción', duration: '1h 57m', rating: '+14', palette: 'from-[#0b0b0d] via-[#3d4249] to-[#aeb8c3]', poster: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd4298?auto=format&fit=crop&w=900&q=88' },
  { id: 'heart', title: 'La última luz', genre: 'Drama · Misterio', duration: '2h 04m', rating: 'APT', palette: 'from-[#091319] via-[#3d5d6b] to-[#c6d9dc]', poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=900&q=88' },
  { id: 'family', title: 'Ecos del mar', genre: 'Aventura · Familiar', duration: '1h 44m', rating: 'APT', palette: 'from-[#0b1720] via-[#34687e] to-[#c7e8ef]', poster: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=88' },
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

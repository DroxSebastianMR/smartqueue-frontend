import { createHash, randomBytes, scryptSync } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { expandDemoAuditoriums } from './expand-demo-auditoriums.mjs';

const db = new PrismaClient({ log: ['error'] });
const uid = (key) => {
  const x = createHash('sha256').update(`cinetrux-demo-v1:${key}`).digest('hex');
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-4${x.slice(13, 16)}-a${x.slice(17, 20)}-${x.slice(20, 32)}`;
};
const unusedPasswordHash = () => {
  const salt = randomBytes(16);
  return `scrypt:${salt.toString('hex')}:${scryptSync(randomBytes(48), salt, 64).toString('hex')}`;
};

// Fictional educational content: not a verified commercial listing.
const titles = [
  ['spider-man-brand-new-day', 'Spider-Man: Un nuevo día', 'https://www.impawards.com/2026/posters/spiderman_brand_new_day_ver17_xlg.jpg', 'NOW_PLAYING'],
  ['blue-lock', 'Blue Lock', 'https://m.media-amazon.com/images/M/MV5BZDJlNTFkNmItMmM5Zi00YWYxLTg3ODgtYWNkNWJhYWNlYjdjXkEyXkFqcGc%40._V1_.jpg', 'NOW_PLAYING'],
  ['cars-20', 'Cars: 20 aniversario', 'https://media-cine.entradas.com/images/film/cars-20-aniversario-109127.v17895696256000.jpg', 'NOW_PLAYING'],
  ['magic-tree', 'El Árbol Mágico', 'https://cdn.cinemark.cl/content/posters/HO00015188.jpg', 'NOW_PLAYING'],
  ['avengers-doomsday', 'Avengers: Doomsday', 'https://image.tmdb.org/t/p/original/jzPwsojjFStf5lR5Nm07w2hH56G.jpg', 'UPCOMING'],
  ['street-fighter-2026', 'Street Fighter', 'https://cdn.kinocheck.com/i/w%3D1200/9hgzyq4ym3.jpg', 'UPCOMING'],
  ['clayface-2026', 'Clayface', 'https://www.impawards.com/2026/posters/clayface_xlg.jpg', 'UPCOMING'],
  ['whalefall-2026', 'Whalefall', 'https://cdn.moviefone.com/admin-uploads/highlights/images/whalefall-official-teaser-poster_1781031419.webp', 'UPCOMING'],
  ['wildwood-2026', 'Wildwood', 'https://media2.firstshowing.net/firstshowing/img18/wildwoodfinalpostermainimgb59.jpg', 'UPCOMING'],
  ['sunrise-on-the-reaping', 'The Hunger Games: Sunrise on the Reaping', 'https://www.impawards.com/2026/posters/hunger_games_sunrise_on_the_reaping_xlg.jpg', 'UPCOMING'],
  ['cat-in-the-hat-2026', 'The Cat in the Hat', 'https://www.cinemaclock.com/images/posters/1000x1500/19/the-cat-in-the-hat-2026-orig-poster.jpg', 'UPCOMING'],
  ['the-odyssey-2026', 'The Odyssey', 'https://cdn.posteritati.com/posters/000/000/079/359/the-odyssey-md-web.jpg', 'UPCOMING'],
  ['godzilla-minus-zero', 'Godzilla Minus Zero', 'https://images.squarespace-cdn.com/content/v1/5bbcad0f2727be3646b9fee1/23b248aa-b236-4ecd-a1af-e926ea528e81/IMG_1910.jpeg', 'UPCOMING'],
  ['dune-part-three', 'Dune: Part Three', 'https://www.impawards.com/2026/posters/dune_part_three_xlg.jpg', 'UPCOMING'],
];

// Metadata used by the local catalogue only.  It is deliberately deterministic,
// additive and clearly marked as demo content; it is not a commercial release
// calendar nor a source of truth for a real cinema operation.
const movieProfiles = {
  'spider-man-brand-new-day': {
    durationMin: 146, ageRating: 'PG-13', originalLanguageCode: 'en',
    synopsis: 'Un héroe joven debe equilibrar su vida cotidiana con una amenaza que cambia su ciudad.',
    genres: ['Acción', 'Aventura'], formats: ['TWO_D', 'THREE_D'],
  },
  'blue-lock': {
    durationMin: 108, ageRating: 'PG-13', originalLanguageCode: 'ja',
    synopsis: 'Un equipo enfrenta el partido decisivo con una estrategia que exige superar sus límites.',
    genres: ['Animación', 'Deportes'], formats: ['TWO_D'],
  },
  'cars-20': {
    durationMin: 102, ageRating: 'Apta para todos', originalLanguageCode: 'en',
    synopsis: 'Una celebración familiar sobre amistad, velocidad y los recuerdos que unen generaciones.',
    genres: ['Animación', 'Familiar'], formats: ['TWO_D'],
  },
  'magic-tree': {
    durationMin: 117, ageRating: 'PG', originalLanguageCode: 'en',
    synopsis: 'Una familia descubre que un antiguo árbol guarda un secreto capaz de cambiar su futuro.',
    genres: ['Fantasía', 'Familiar'], formats: ['TWO_D'],
  },
  'avengers-doomsday': {
    durationMin: 160, ageRating: 'PG-13', originalLanguageCode: 'en',
    synopsis: 'El destino de los héroes converge en el próximo gran evento de Marvel Studios.',
    genres: ['Acción', 'Ciencia ficción'], formats: ['TWO_D', 'THREE_D', 'INFINITY_VISION'],
  },
  'street-fighter-2026': {
    durationMin: 128, ageRating: 'PG-13', originalLanguageCode: 'en',
    synopsis: 'Rivales de todo el mundo entran a un torneo donde cada combate revela una nueva alianza.',
    genres: ['Acción', 'Aventura'], formats: ['TWO_D', 'THREE_D'],
  },
  'clayface-2026': {
    durationMin: 122, ageRating: 'PG-13', originalLanguageCode: 'en',
    synopsis: 'Un artista atrapado entre identidades descubre que su transformación tiene un precio.',
    genres: ['Suspenso', 'Drama'], formats: ['TWO_D'],
  },
  'whalefall-2026': {
    durationMin: 112, ageRating: 'PG-13', originalLanguageCode: 'en',
    synopsis: 'Una inmersión extrema convierte una misión de rescate en una lucha por sobrevivir.',
    genres: ['Suspenso', 'Aventura'], formats: ['TWO_D'],
  },
  'wildwood-2026': {
    durationMin: 105, ageRating: 'PG', originalLanguageCode: 'en',
    synopsis: 'Dos hermanos se internan en un bosque fantástico para recuperar aquello que más quieren.',
    genres: ['Animación', 'Fantasía', 'Familiar'], formats: ['TWO_D'],
  },
  'sunrise-on-the-reaping': {
    durationMin: 142, ageRating: 'PG-13', originalLanguageCode: 'en',
    synopsis: 'Un nuevo amanecer pone a prueba la memoria, la esperanza y la voluntad de sobrevivir.',
    genres: ['Drama', 'Ciencia ficción'], formats: ['TWO_D'],
  },
  'cat-in-the-hat-2026': {
    durationMin: 96, ageRating: 'Apta para todos', originalLanguageCode: 'en',
    synopsis: 'Una visita inesperada transforma una tarde común en una aventura llena de imaginación.',
    genres: ['Animación', 'Familiar'], formats: ['TWO_D'],
  },
  'the-odyssey-2026': {
    durationMin: 154, ageRating: 'PG-13', originalLanguageCode: 'en',
    synopsis: 'Un viaje épico de regreso a casa enfrenta a un héroe con decisiones imposibles.',
    genres: ['Aventura', 'Drama'], formats: ['TWO_D', 'INFINITY_VISION'],
  },
  'godzilla-minus-zero': {
    durationMin: 124, ageRating: 'PG-13', originalLanguageCode: 'ja',
    synopsis: 'Una ciudad costera debe unirse cuando una amenaza imposible vuelve a emerger.',
    genres: ['Acción', 'Ciencia ficción'], formats: ['TWO_D', 'THREE_D'],
  },
  'dune-part-three': {
    durationMin: 166, ageRating: 'PG-13', originalLanguageCode: 'en',
    synopsis: 'El equilibrio entre poder, destino y desierto llega a una nueva etapa decisiva.',
    genres: ['Ciencia ficción', 'Aventura'], formats: ['TWO_D', 'INFINITY_VISION'],
  },
};

const genreDefinitions = [
  ['accion', 'Acción'], ['animacion', 'Animación'], ['aventura', 'Aventura'],
  ['ciencia-ficcion', 'Ciencia ficción'], ['deportes', 'Deportes'], ['drama', 'Drama'],
  ['familiar', 'Familiar'], ['fantasia', 'Fantasía'], ['suspenso', 'Suspenso'],
];
const locations = [
  ['cinetrux-centro', 'Cinetrux Demo Centro', 'Cercado de Lima', -12.0464, -77.0428],
  ['cinetrux-san-miguel', 'Cinetrux Demo San Miguel', 'San Miguel', -12.0777, -77.0936],
  ['cinetrux-primavera', 'Cinetrux Demo Primavera', 'Santiago de Surco', -12.1110, -76.9932],
  ['cinetrux-miraflores', 'Cinetrux Demo Miraflores', 'Miraflores', -12.1211, -77.0297],
  ['cinetrux-trujillo', 'Cinetrux Demo Trujillo', 'Trujillo', -8.1116, -79.0287],
];

async function users() {
  for (const [role, email] of [['ADMIN', 'admin.seed@cinetrux.invalid'], ['CUSTOMER', 'cliente.seed@cinetrux.invalid']]) {
    const user = await db.user.upsert({ where: { email }, update: {}, create: { id: uid(`user:${role}`), email, passwordHash: unusedPasswordHash(), status: 'DISABLED' } });
    await db.userRoleAssignment.upsert({ where: { id: uid(`role:${role}`) }, update: {}, create: { id: uid(`role:${role}`), userId: user.id, role } });
  }
}

async function catalog() {
  const genresByName = new Map();
  for (const [slug, name] of genreDefinitions) {
    const genre = await db.genre.upsert({
      where: { slug },
      update: { name },
      create: { id: uid(`genre:${slug}`), slug, name },
    });
    genresByName.set(name, genre);
  }
  for (const [priority, [slug, title, posterUrl, section]] of titles.entries()) {
    const profile = movieProfiles[slug];
    const movie = await db.movie.upsert({
      where: { slug },
      update: {
        title, posterUrl, synopsis: profile.synopsis, durationMin: profile.durationMin,
        ageRating: profile.ageRating, originalLanguageCode: profile.originalLanguageCode,
        publicationStatus: 'PUBLISHED',
      },
      create: {
        id: uid(`movie:${slug}`), slug, title, posterUrl, synopsis: profile.synopsis,
        durationMin: profile.durationMin, ageRating: profile.ageRating,
        originalLanguageCode: profile.originalLanguageCode, publicationStatus: 'PUBLISHED',
      },
    });
    await db.movieCatalogPlacement.upsert({
      where: { movieId_section: { movieId: movie.id, section } },
      update: { priority },
      create: { movieId: movie.id, section, priority },
    });
    await db.movieAsset.upsert({
      where: { id: uid(`poster:${slug}`) },
      update: { url: posterUrl, isPrimary: true },
      create: { id: uid(`poster:${slug}`), movieId: movie.id, kind: 'POSTER', url: posterUrl, provider: 'EXTERNAL', isPrimary: true },
    });
    for (const genreName of profile.genres) {
      const genre = genresByName.get(genreName);
      await db.movieGenre.upsert({
        where: { movieId_genreId: { movieId: movie.id, genreId: genre.id } },
        update: {}, create: { movieId: movie.id, genreId: genre.id },
      });
    }
    for (const format of profile.formats) {
      await db.movieVersion.upsert({
        where: { id: uid(`version:${slug}:${format}`) },
        update: { audioLanguageCode: 'es-419', label: format === 'INFINITY_VISION' ? 'Infinity Vision · Doblada' : format === 'THREE_D' ? '3D · Doblada' : '2D · Doblada' },
        create: {
          id: uid(`version:${slug}:${format}`), movieId: movie.id, format,
          audioLanguageCode: 'es-419', label: format === 'INFINITY_VISION' ? 'Infinity Vision · Doblada' : format === 'THREE_D' ? '3D · Doblada' : '2D · Doblada',
        },
      });
    }
  }
  const movie = await db.movie.findUniqueOrThrow({ where: { slug: 'avengers-doomsday' } });
  const logoUrl = 'https://image.tmdb.org/t/p/original/veL7UArbDt2kgFTDME0DgJdRpxa.png';
  const synopsis = 'El destino de los héroes converge en el próximo gran evento de Marvel Studios.';
  await db.movie.updateMany({ where: { id: movie.id, synopsis: null }, data: { synopsis } });
  await db.movieRelease.upsert({ where: { movieId_countryCode: { movieId: movie.id, countryCode: 'PE' } }, update: { status: 'PRESALE' }, create: { movieId: movie.id, countryCode: 'PE', releaseDate: new Date('2026-12-17T00:00:00Z'), status: 'PRESALE' } });
  await db.movieAsset.upsert({ where: { id: uid('trailer:avengers') }, update: {}, create: { id: uid('trailer:avengers'), movieId: movie.id, kind: 'TRAILER', provider: 'YOUTUBE', url: 'https://www.youtube.com/watch?v=lAr_uspgHm8', locale: 'es-419' } });
  const bannerDefinitions = [
    { key: 'avengers', movieSlug: 'avengers-doomsday', title: 'Avengers: Doomsday', logoUrl, backdropUrl: 'https://i.ytimg.com/vi/lAr_uspgHm8/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=lAr_uspgHm8', videoProvider: 'YOUTUBE', ctaLabel: 'Ver funciones', ctaHref: '/#cinema-finder', priority: 1 },
    { key: 'street-fighter', movieSlug: 'street-fighter-2026', title: 'Street Fighter', logoUrl: null, backdropUrl: 'https://cdn.kinocheck.com/i/w%3D1200/9hgzyq4ym3.jpg', videoUrl: null, videoProvider: null, ctaLabel: 'Conocer estreno', ctaHref: '/peliculas/street-fighter-2026', priority: 2 },
    { key: 'whalefall', movieSlug: 'whalefall-2026', title: 'Whalefall', logoUrl: null, backdropUrl: 'https://cdn.moviefone.com/admin-uploads/highlights/images/whalefall-official-teaser-poster_1781031419.webp', videoUrl: null, videoProvider: null, ctaLabel: 'Conocer estreno', ctaHref: '/peliculas/whalefall-2026', priority: 3 },
    { key: 'odyssey', movieSlug: 'the-odyssey-2026', title: 'The Odyssey', logoUrl: null, backdropUrl: 'https://cdn.posteritati.com/posters/000/000/079/359/the-odyssey-md-web.jpg', videoUrl: null, videoProvider: null, ctaLabel: 'Conocer estreno', ctaHref: '/peliculas/the-odyssey-2026', priority: 4 },
  ];
  for (const banner of bannerDefinitions) {
    const bannerMovie = await db.movie.findUniqueOrThrow({ where: { slug: banner.movieSlug } });
    await db.banner.upsert({
      where: { id: uid(`banner:${banner.key}`) },
      update: { movieId: bannerMovie.id, title: banner.title, logoUrl: banner.logoUrl, backdropUrl: banner.backdropUrl, videoUrl: banner.videoUrl, videoProvider: banner.videoProvider, ctaLabel: banner.ctaLabel, ctaHref: banner.ctaHref, status: 'ACTIVE', priority: banner.priority },
      create: { id: uid(`banner:${banner.key}`), movieId: bannerMovie.id, title: banner.title, logoUrl: banner.logoUrl, backdropUrl: banner.backdropUrl, videoUrl: banner.videoUrl, videoProvider: banner.videoProvider, ctaLabel: banner.ctaLabel, ctaHref: banner.ctaHref, status: 'ACTIVE', priority: banner.priority },
    });
  }

  const advertisements = [
    { key: 'combo', title: 'Combos para tu función', description: 'Canchita, bebida y snacks para disfrutar antes de que se apaguen las luces.', ctaLabel: 'Ver dulcería', ctaHref: '/#promotions', imageUrl: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=900&q=85', priority: 1 },
    { key: 'salas', title: 'Pantalla a tu manera', description: 'Elige 2D, 3D o Infinity Vision según la función disponible.', ctaLabel: 'Explorar formatos', ctaHref: '/#now-playing', imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=85', priority: 2 },
    { key: 'anticipada', title: 'Compra con anticipación', description: 'Consulta horarios, selecciona tus butacas y llega con todo listo.', ctaLabel: 'Ver cartelera', ctaHref: '/#now-playing', imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=85', priority: 3 },
    { key: 'familia', title: 'Plan para compartir', description: 'Encuentra funciones familiares y arma una salida para todos.', ctaLabel: 'Ver películas', ctaHref: '/#now-playing', imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=85', priority: 4 },
    { key: 'proximamente', title: 'Muy pronto en Cinetrux', description: 'Guarda tus próximos estrenos favoritos y revisa sus preventas.', ctaLabel: 'Descubrir estrenos', ctaHref: '/proximos-estrenos', imageUrl: 'https://images.unsplash.com/photo-1485095329183-d0797cdc5676?auto=format&fit=crop&w=900&q=85', priority: 5 },
  ];
  for (const ad of advertisements) {
    const { key, ...content } = ad;
    await db.advertisement.upsert({
      where: { id: uid(`ad:${key}`) },
      update: { ...content, placement: 'HOME', status: 'ACTIVE' },
      create: { id: uid(`ad:${key}`), ...content, placement: 'HOME', status: 'ACTIVE' },
    });
  }

  const promotions = [
    { key: 'canchas', title: 'Combo Canchas', description: 'Canchita grande, dos bebidas y una experiencia lista para compartir.', imageUrl: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=1400&q=88', ctaLabel: 'Elegir mi combo', ctaHref: '/purchase', terms: 'Contenido demostrativo. Precios y disponibilidad se confirman durante la compra.' },
    { key: 'pareja', title: 'Combo Pareja', description: 'Dos bebidas, canchita mediana y snack dulce para tu próxima función.', imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=88', ctaLabel: 'Ver opciones', ctaHref: '/purchase', terms: 'Contenido demostrativo.' },
    { key: 'familia', title: 'Combo Familiar', description: 'Una alternativa pensada para compartir: canchita grande, bebidas y dulces.', imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1400&q=88', ctaLabel: 'Ver opciones', ctaHref: '/purchase', terms: 'Contenido demostrativo.' },
    { key: 'nachos', title: 'Nachos + bebida', description: 'Un snack salado con bebida fría para complementar tu entrada.', imageUrl: 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?auto=format&fit=crop&w=1400&q=88', ctaLabel: 'Ver opciones', ctaHref: '/purchase', terms: 'Contenido demostrativo.' },
    { key: 'dulce', title: 'Dulce para la función', description: 'Elige golosinas y bebidas para llevar a tu butaca.', imageUrl: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=1400&q=88', ctaLabel: 'Ver opciones', ctaHref: '/purchase', terms: 'Contenido demostrativo.' },
  ];
  for (const promotion of promotions) {
    const { key, ...content } = promotion;
    await db.promotion.upsert({
      where: { id: uid(`promo:${key}`) },
      update: { ...content, status: 'ACTIVE' },
      create: { id: uid(`promo:${key}`), ...content, status: 'ACTIVE' },
    });
  }

  const concessionProducts = [
    { slug: 'combo-canchas', name: 'Combo Canchas', description: 'Canchita grande y dos bebidas medianas.', category: 'COMBO', priceCents: 2990, featured: true, priority: 1, imageUrl: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=900&q=85' },
    { slug: 'combo-pareja', name: 'Combo Pareja', description: 'Canchita mediana, dos bebidas y snack dulce.', category: 'COMBO', priceCents: 2490, featured: true, priority: 2, imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=85' },
    { slug: 'combo-familiar', name: 'Combo Familiar', description: 'Canchita grande, cuatro bebidas y dulces para compartir.', category: 'COMBO', priceCents: 4590, featured: true, priority: 3, imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=85' },
    { slug: 'canchita-grande', name: 'Canchita grande', description: 'Preparada al momento para compartir.', category: 'POPCORN', priceCents: 1390, featured: false, priority: 4, imageUrl: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=900&q=85' },
    { slug: 'gaseosa-mediana', name: 'Bebida mediana', description: 'Bebida fría de 22 oz.', category: 'BEVERAGE', priceCents: 750, featured: false, priority: 5, imageUrl: 'https://images.unsplash.com/photo-1629203849820-fdd70d49c38e?auto=format&fit=crop&w=900&q=85' },
    { slug: 'agua-mineral', name: 'Agua mineral', description: 'Agua sin gas de 625 ml.', category: 'BEVERAGE', priceCents: 500, featured: false, priority: 6, imageUrl: 'https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=900&q=85' },
    { slug: 'nachos-queso', name: 'Nachos con queso', description: 'Nachos crocantes acompañados de salsa de queso.', category: 'SNACK', priceCents: 1190, featured: true, priority: 7, imageUrl: 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?auto=format&fit=crop&w=900&q=85' },
    { slug: 'chocolate-clasico', name: 'Chocolate clásico', description: 'Tableta de chocolate para la función.', category: 'CANDY', priceCents: 650, featured: false, priority: 8, imageUrl: 'https://images.unsplash.com/photo-1548907040-4d42f6a8f4d2?auto=format&fit=crop&w=900&q=85' },
  ];
  for (const product of concessionProducts) {
    await db.concessionProduct.upsert({
      where: { slug: product.slug },
      update: { ...product, available: true, currency: 'PEN' },
      create: { id: uid(`concession:${product.slug}`), ...product, available: true, currency: 'PEN' },
    });
  }
}

async function theatres() {
  const limaToday = new Date(Date.now() - 5 * 60 * 60_000).toISOString().slice(0, 10);
  const rooms = [
    { name: 'Sala Demo 1', formats: ['TWO_D', 'THREE_D'], capacity: 120, cleanup: 20 },
    { name: 'Sala Platinum', formats: ['TWO_D', 'THREE_D'], capacity: 96, cleanup: 25 },
    { name: 'Sala Infinity', formats: ['TWO_D', 'INFINITY_VISION'], capacity: 84, cleanup: 30 },
  ];
  const playingRotation = [
    ['spider-man-brand-new-day', 'TWO_D'],
    ['blue-lock', 'TWO_D'],
    ['cars-20', 'TWO_D'],
    ['magic-tree', 'TWO_D'],
    ['avengers-doomsday', 'TWO_D'],
    ['avengers-doomsday', 'THREE_D'],
    ['avengers-doomsday', 'INFINITY_VISION'],
  ];
  const showtimesToCreate = [];
  for (const [slug, name, district, latitude, longitude] of locations) {
    const city = slug === 'cinetrux-trujillo' ? 'Trujillo' : 'Lima';
    const cinema = await db.cinema.upsert({ where: { slug }, update: { city, district, latitude, longitude }, create: { id: uid(`cinema:${slug}`), slug, name, city, region: city === 'Lima' ? 'Lima' : 'La Libertad', district, countryCode: 'PE', address: 'Ubicación aproximada de demostración; no existe sede comercial', timeZone: 'America/Lima', latitude, longitude } });
    const seededRooms = [];
    for (const roomDefinition of rooms) {
      const roomKey = `${slug}:${roomDefinition.name}`;
      const room = await db.auditorium.upsert({
        where: { cinemaId_name: { cinemaId: cinema.id, name: roomDefinition.name } },
        update: { capacity: roomDefinition.capacity, supportedFormats: roomDefinition.formats, cleanupBufferMinutes: roomDefinition.cleanup },
        create: { id: roomDefinition.name === 'Sala Demo 1' ? uid(`room:${slug}`) : uid(`room:${roomKey}`), cinemaId: cinema.id, name: roomDefinition.name, capacity: roomDefinition.capacity, supportedFormats: roomDefinition.formats, cleanupBufferMinutes: roomDefinition.cleanup },
      });
      seededRooms.push(room);
      if (roomDefinition.name !== 'Sala Demo 1') {
        const seats = [...'ABCDEFGH'].flatMap((row) =>
          Array.from({ length: 12 }, (_, index) => ({
            id: uid(`seat:${roomKey}:${row}:${index + 1}`), auditoriumId: room.id,
            row, number: index + 1,
            type: row === 'D' && index === 0 ? 'ACCESSIBLE' : row === 'D' && index === 1 ? 'COMPANION' : 'FGH'.includes(row) ? 'PREMIUM' : 'STANDARD',
          })),
        );
        await db.seat.createMany({ data: seats, skipDuplicates: true });
      }
    }
    const [year, month, day] = limaToday.split('-').map(Number);
    for (let offset = 0; offset < 7; offset++) {
      const date = new Date(Date.UTC(year, month - 1, day + offset)).toISOString().slice(0, 10);
      for (const [roomIndex, room] of seededRooms.entries()) {
        const candidates = roomIndex === 2
          ? [['avengers-doomsday', 'INFINITY_VISION'], ['the-odyssey-2026', 'INFINITY_VISION']]
          : roomIndex === 1
            ? [['avengers-doomsday', 'THREE_D'], ['street-fighter-2026', 'THREE_D'], ['godzilla-minus-zero', 'THREE_D']]
            : playingRotation;
        for (const [slot, hour] of [13, 16, 19, 22].entries()) {
          const [movieSlug, format] = candidates[(offset + slot + roomIndex) % candidates.length];
          const duration = movieProfiles[movieSlug].durationMin;
          const startsAt = new Date(`${date}T${String(hour).padStart(2, '0')}:00:00-05:00`);
          if (startsAt <= new Date()) continue;
          const showId = uid(`show:v2:${slug}:${room.id}:${date}:${hour}`);
          showtimesToCreate.push({
            id: showId, auditoriumId: room.id, movieVersionId: uid(`version:${movieSlug}:${format}`),
            startsAt, endsAt: new Date(startsAt.getTime() + duration * 60_000), status: 'ON_SALE',
            basePriceCents: roomIndex === 2 ? 3800 : roomIndex === 1 ? 3200 : 2500,
            currency: 'PEN', bookingOpensAt: new Date(startsAt.getTime() - 14 * 86_400_000),
          });
        }
      }
    }
  }
  await db.showtime.createMany({ data: showtimesToCreate, skipDuplicates: true });
}

async function operations() {
  await db.event.upsert({ where: { slug: 'estreno-galactico' }, update: {}, create: { id: uid('event:estreno'), slug: 'estreno-galactico', name: 'Estreno de medianoche (demo)', description: 'Evento ficticio SmartQueue ML.', startsAt: new Date('2026-12-17T23:45:00-05:00'), capacity: 100, availableStock: 100 } });
  const user = await db.user.findUniqueOrThrow({ where: { email: 'cliente.seed@cinetrux.invalid' } });
  const room = await db.auditorium.findUniqueOrThrow({ where: { id: uid('room:cinetrux-centro') } });
  const seat = await db.seat.findUniqueOrThrow({ where: { auditoriumId_row_number: { auditoriumId: room.id, row: 'A', number: 2 } } });
  const showtime = await db.showtime.upsert({ where: { id: uid('show:historical') }, update: {}, create: { id: uid('show:historical'), auditoriumId: room.id, movieVersionId: uid('version:avengers-doomsday:TWO_D'), startsAt: new Date('2026-01-15T22:00:00Z'), endsAt: new Date('2026-01-16T00:30:00Z'), status: 'FINISHED', basePriceCents: 2500 } });
  const order = await db.bookingOrder.upsert({ where: { id: uid('order:historical') }, update: {}, create: { id: uid('order:historical'), userId: user.id, showtimeId: showtime.id, status: 'EXPIRED', totalCents: 2500, expiresAt: new Date('2026-01-15T21:45:00Z') } });
  await db.ticket.upsert({ where: { id: uid('ticket:historical') }, update: {}, create: { id: uid('ticket:historical'), userId: user.id, showtimeId: showtime.id, seatId: seat.id, orderId: order.id, code: 'DEMO-CANCELLED-001', status: 'CANCELLED', amountCents: 2500 } });
}

try {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_SEED !== 'true') throw new Error('Demo seed disabled in production');
  await users(); await catalog(); await theatres(); await operations();
  await expandDemoAuditoriums(db);
  const counts = await Promise.all([db.user.count(), db.movie.count(), db.cinema.count(), db.showtime.count(), db.ticket.count(), db.banner.count(), db.promotion.count(), db.concessionProduct.count()]);
  console.log(`Demo seed complete: users=${counts[0]}, movies=${counts[1]}, cinemas=${counts[2]}, showtimes=${counts[3]}, tickets=${counts[4]}, banners=${counts[5]}, promotions=${counts[6]}, concessions=${counts[7]}. Accounts are disabled; no charges created.`);
} finally { await db.$disconnect(); }

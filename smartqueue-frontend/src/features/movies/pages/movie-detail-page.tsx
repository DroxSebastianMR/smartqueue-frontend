import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, Ticket } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { PATHS } from '@/app/router/constants/paths';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Carousel } from '@/components/ui/carousel';
import { MovieCard } from '@/features/home/components/movie-card';
import { useHomeCinemas, useMovie, useMovieSchedule, useNowPlayingMovies, useUpcomingMovies } from '@/features/home/hooks/use-home-content';
import { useHomeSelectionStore } from '@/features/home/store/home-selection.store';

const FORMAT_LABELS: Record<string, string> = { TWO_D: '2D', THREE_D: '3D', INFINITY_VISION: 'Infinity Vision' };
const languageName = (code: string) => code.toLowerCase().startsWith('es') ? 'Doblada' : code.toLowerCase().startsWith('en') ? 'Inglés' : code;
const longDate = (value: string | null) => value ? new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)) : 'Por confirmar';
const shortDate = (value: string) => {
  const parts = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', timeZone: 'UTC' }).formatToParts(new Date(`${value}T00:00:00Z`));
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  const month = (parts.find((part) => part.type === 'month')?.value ?? '').replace('.', '').slice(0, 3).toUpperCase();
  return `${day}/${month}`;
};

export function MovieDetailPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const setMovieSlug = useHomeSelectionStore((state) => state.setMovieSlug);
  const movieQuery = useMovie(slug);
  const cinemasQuery = useHomeCinemas();
  const [cinemaSlug, setCinemaSlug] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [formatFilter, setFormatFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const scheduleQuery = useMovieSchedule(slug, cinemaSlug);
  const nowPlaying = useNowPlayingMovies();
  const upcoming = useUpcomingMovies();

  useEffect(() => { if (!cinemaSlug && cinemasQuery.data?.[0]) setCinemaSlug(cinemasQuery.data[0].slug); }, [cinemaSlug, cinemasQuery.data]);
  useEffect(() => { if (scheduleQuery.data?.days[0] && !scheduleQuery.data.days.some((day) => day.date === selectedDate)) setSelectedDate(scheduleQuery.data.days[0].date); }, [scheduleQuery.data, selectedDate]);

  if (movieQuery.isPending) return <MovieDetailSkeleton />;
  if (movieQuery.isError || !movieQuery.data) return <MovieError />;

  const movie = movieQuery.data;
  const cinema = cinemasQuery.data?.find((item) => item.slug === cinemaSlug);
  const day = scheduleQuery.data?.days.find((item) => item.date === selectedDate);
  const groups = (day?.groups ?? []).filter((group) => (!formatFilter || group.format === formatFilter) && (!languageFilter || group.audioLanguage === languageFilter));
  const scheduleFormats = [...new Set(scheduleQuery.data?.days.flatMap((item) => item.groups.map((group) => group.format)) ?? [])];
  const scheduleLanguages = [...new Set(scheduleQuery.data?.days.flatMap((item) => item.groups.map((group) => group.audioLanguage)) ?? [])];
  const related = [...(nowPlaying.data ?? []), ...(upcoming.data ?? [])]
    .filter((item, index, all) => item.id !== movie.id && all.findIndex((candidate) => candidate.id === item.id) === index)
    .slice(0, 10);
  const goToShowtimes = () => { setMovieSlug(movie.id); navigate('/#cinema-finder'); };

  return (
    <div className="min-h-screen bg-[#0b0b0a] text-white [font-family:'Barlow_Condensed',Inter,sans-serif]">
      <div className="mx-auto max-w-[1180px] px-5 pb-24 pt-32 sm:px-8 lg:px-10">
        <Link to="/#now-playing" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-zinc-400 transition hover:text-white"><ArrowLeft className="size-4" /> Volver a cartelera</Link>
        <div className="mt-9 grid items-start gap-12 lg:grid-cols-[340px_minmax(0,1fr)] xl:gap-20">
          <section>
            <h1 className="text-5xl font-extrabold uppercase leading-[.98] tracking-[-.035em] text-zinc-50">{movie.title}</h1>
            <div className="relative mt-7 overflow-hidden rounded-md bg-zinc-900 shadow-[0_25px_70px_rgba(0,0,0,.4)]">
              <img src={movie.poster} alt={`Póster de ${movie.title}`} className="aspect-[2/3] w-full object-cover" referrerPolicy="no-referrer" />
              <span className="absolute left-3 top-3 rounded bg-black/70 px-2 py-1 text-xs font-extrabold">{movie.duration}</span>
              <span className="absolute right-3 top-3 rounded bg-black/70 px-2 py-1 text-xs font-extrabold">{movie.rating}</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">{movie.genres.length ? movie.genres.map((genre) => <Badge key={genre} className="rounded border-white/25 bg-transparent px-3 py-1.5 text-xs text-white">☺&nbsp; {genre}</Badge>) : <Badge>Género por confirmar</Badge>}</div>
            <p className="mt-5 text-sm leading-6 text-zinc-200">{movie.synopsis || 'La sinopsis de esta película estará disponible próximamente.'}</p>
            <dl className="mt-7 border-t border-white/15">
              <Fact label="Formatos disponibles" value={movie.formats.join(' · ') || 'Por confirmar'} />
              <Fact label="Duración" value={movie.duration} />
              <Fact label="Clasificación" value={movie.rating} />
              <Fact label="Fecha de estreno" value={longDate(movie.releaseDate)} />
              <Fact label="Distribuidor" value="Por confirmar" />
              <Fact label="Actores y director" value="Información próximamente" controls last />
            </dl>
          </section>

          <section>
            <h2 className="text-[44px] font-extrabold uppercase leading-none tracking-[.01em] text-zinc-50">Horarios</h2>
            <div className="mt-12 max-w-2xl">
              <div className="relative inline-flex h-[50px] items-center rounded-[10px] bg-[#242321] px-5 text-[19px] font-extrabold uppercase tracking-[.02em] text-white shadow-sm transition hover:bg-[#2b2a28] focus-within:ring-2 focus-within:ring-sky-300/40">
                <span>Ver la cartelera por cine</span><ChevronRight className="ml-4 size-4 text-zinc-300" />
                <select aria-label="Ver la cartelera por cine" value={cinemaSlug} onChange={(event) => { setCinemaSlug(event.target.value); setSelectedDate(''); }} className="absolute inset-0 size-full cursor-pointer appearance-none opacity-0"><option value="">Selecciona un cine</option>{cinemasQuery.data?.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select>
              </div>
              <div className="mt-5 grid max-w-[500px] grid-cols-3 overflow-hidden rounded-[10px]">{(scheduleQuery.data?.days ?? []).slice(0, 3).map((item, index) => <button key={item.date} type="button" onClick={() => setSelectedDate(item.date)} className={`h-[76px] border-r border-black/35 px-3 py-2 text-lg font-extrabold uppercase leading-tight last:border-r-0 ${selectedDate === item.date ? 'bg-white text-black' : 'bg-[#242321] text-white hover:bg-[#2c2b29]'}`}><span className="block">{index === 0 ? 'Hoy' : item.weekday.slice(0, 3)}</span><span className="mt-1.5 block text-[15px] font-medium uppercase opacity-100">{shortDate(item.date)}</span></button>)}</div>
              <div className="mt-5 grid max-w-[365px] grid-cols-2 gap-px overflow-hidden rounded-[12px] bg-black/40"><FilterSelect label="Formatos" value={formatFilter} onChange={setFormatFilter} options={scheduleFormats.map((value) => ({ value, label: FORMAT_LABELS[value] ?? value }))} /><FilterSelect label="Idioma" value={languageFilter} onChange={setLanguageFilter} options={scheduleLanguages.map((value) => ({ value, label: languageName(value) }))} /></div>

              <div className="mt-9"><p className="text-[18px] font-bold uppercase leading-none tracking-[.01em] text-white">Disponibilidad de asientos</p><div className="mt-4 flex flex-wrap gap-5 text-[14px] font-medium text-zinc-300"><span>🟢 Alta</span><span>🟡 Media</span><span>🔴 Baja</span><span>◼ Lleno</span></div></div>
              <div className="mt-9"><p className="text-[17px] font-bold uppercase leading-none tracking-[.01em] text-white">Cine principal</p><h3 className="mt-4 text-[26px] font-bold uppercase leading-[1.1] tracking-[-.01em] text-white">Horarios en <span className="text-sky-300">{cinema?.name ?? 'tu cine'}</span></h3>{cinema && <p className="mt-4 text-base font-semibold leading-tight text-white">Dirección: {cinema.address}</p>}</div>
              <div className="mt-7 space-y-7">
                {scheduleQuery.isPending && cinemaSlug && <p className="text-sm text-zinc-500">Cargando horarios…</p>}
                {!scheduleQuery.isPending && groups.map((group) => <div key={`${group.format}-${group.audioLanguage}-${group.subtitleLanguage}`}><p className="text-xs font-semibold uppercase tracking-wide text-zinc-200">{FORMAT_LABELS[group.format] ?? group.format} <span className="text-sky-300">·</span> <span className="capitalize">{languageName(group.audioLanguage)}</span>{group.subtitleLanguage ? ' · Subtitulada' : ''}</p><div className="mt-3 flex flex-wrap gap-2">{group.slots.map((slot) => <button key={slot.showtimeId} type="button" disabled={!slot.bookable} onClick={goToShowtimes} className="inline-flex items-center gap-2 rounded-md border border-sky-200/10 bg-sky-200/[.07] px-3 py-2 text-xs font-semibold text-sky-50 transition hover:border-sky-200/25 hover:bg-sky-200/15 disabled:opacity-40"><Ticket className="size-3.5 text-sky-300" />{slot.localTime}</button>)}</div></div>)}
                {!scheduleQuery.isPending && cinemaSlug && groups.length === 0 && <div className="rounded-lg border border-white/10 bg-white/[.03] p-5"><p className="text-sm font-semibold">No hay funciones para estos filtros.</p><p className="mt-2 text-xs text-zinc-500">Prueba otra fecha, formato, idioma o sede.</p></div>}
                {!cinemaSlug && <p className="text-sm text-zinc-500">Selecciona un cine para consultar sus horarios.</p>}
              </div>
            </div>
          </section>
        </div>

        <section className="mt-24 border-t border-white/10 pt-14"><div className="flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-sky-300">Sigue explorando</p><h2 className="mt-3 text-[46px] font-extrabold uppercase leading-none tracking-[-.02em] text-white">Películas en cartelera</h2></div><Link to="/#now-playing" className="text-sm font-semibold text-zinc-400 hover:text-white">Ver todas</Link></div>{related.length > 0 && <Carousel ariaLabel="Más películas en cartelera" interval={2500} itemClassName="w-[64%] sm:w-[36%] lg:w-[calc((100%-60px)/4)]" className="mt-8">{related.map((item) => <MovieCard key={item.id} movie={item} compact />)}</Carousel>}</section>
      </div>
    </div>
  );
}

function Fact({ label, value, controls = false, last = false }: { label: string; value: string; controls?: boolean; last?: boolean }) {
  return <div className={`grid min-h-[82px] grid-cols-[42%_58%] items-center gap-3 border-b border-white/15 py-4 ${last ? 'border-b-0' : ''}`}><dt className="text-[18px] font-extrabold uppercase leading-[1.05] tracking-[-.01em] text-white">{label}</dt><dd className="flex justify-end text-right text-[17px] font-medium leading-tight text-zinc-50">{controls ? <div className="flex gap-2" aria-label={value}><button type="button" disabled className="flex h-9 w-12 items-center justify-center rounded-lg border-2 border-white/15 text-zinc-500"><ChevronLeft className="size-4" /></button><button type="button" disabled className="flex h-9 w-12 items-center justify-center rounded-lg border-2 border-white/15 text-zinc-500"><ChevronRight className="size-4" /></button></div> : value}</dd></div>;
}
function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) { return <div className="relative"><select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="h-[70px] w-full appearance-none border-0 bg-[#242321] px-7 pr-12 text-lg font-medium text-white outline-none transition hover:bg-[#2c2b29] focus:bg-[#2c2b29]"><option value="">{label}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronDown className="pointer-events-none absolute right-6 top-1/2 size-4 -translate-y-1/2 fill-zinc-300 text-zinc-300" /></div>; }
function MovieError() { return <section className="flex min-h-[72vh] items-center justify-center bg-[#0b0b0a] px-5 pt-28 text-white"><div className="text-center"><h1 className="text-4xl font-black uppercase">Película no disponible</h1><Link to={PATHS.HOME}><Button className="mt-7 rounded-full"><ArrowLeft className="size-4" /> Volver al inicio</Button></Link></div></section>; }
function MovieDetailSkeleton() { return <div className="min-h-screen animate-pulse bg-[#0b0b0a] px-5 pt-36"><div className="mx-auto grid max-w-[1180px] gap-20 lg:grid-cols-[340px_1fr]"><div><div className="h-9 rounded bg-white/10" /><div className="mt-7 aspect-[2/3] rounded bg-white/10" /></div><div><div className="h-10 w-52 rounded bg-white/10" /><div className="mt-8 h-12 max-w-xl rounded bg-white/[.07]" /><div className="mt-4 h-16 max-w-xl rounded bg-white/[.07]" /></div></div></div>; }

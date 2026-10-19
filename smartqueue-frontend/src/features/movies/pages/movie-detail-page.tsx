import { ArrowLeft, ChevronDown, MapPin, Ticket } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { PATHS } from '@/app/router/constants/paths';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useHomeCinemas, useMovie, useMovieSchedule } from '@/features/home/hooks/use-home-content';

const formatLabel: Record<string, string> = { TWO_D: '2D', THREE_D: '3D', INFINITY_VISION: 'Infinity Vision' };

const dateLabel = (date: string, today: boolean) => today
  ? 'Hoy'
  : new Intl.DateTimeFormat('es-PE', { weekday: 'short', day: '2-digit', month: 'short', timeZone: 'UTC' })
    .format(new Date(`${date}T12:00:00Z`)).replace('.', '');

export function MovieDetailPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const movie = useMovie(slug);
  const cinemas = useHomeCinemas();
  const [cinemaSlug, setCinemaSlug] = useState('');
  const [date, setDate] = useState('');
  const [format, setFormat] = useState('');
  const schedule = useMovieSchedule(slug, cinemaSlug);

  useEffect(() => {
    if (!cinemaSlug && cinemas.data?.[0]) setCinemaSlug(cinemas.data[0].slug);
  }, [cinemaSlug, cinemas.data]);
  useEffect(() => {
    if (schedule.data?.days[0] && !schedule.data.days.some((day) => day.date === date)) setDate(schedule.data.days[0].date);
  }, [date, schedule.data]);

  const selectedCinema = cinemas.data?.find((item) => item.slug === cinemaSlug);
  const day = schedule.data?.days.find((item) => item.date === date);
  const formats = useMemo(() => [...new Set(schedule.data?.days.flatMap((item) => item.groups.map((group) => group.format)) ?? [])], [schedule.data]);
  const groups = (day?.groups ?? []).filter((group) => !format || group.format === format);

  if (movie.isPending) return <MovieSkeleton />;
  if (movie.isError || !movie.data) return <MovieNotFound />;
  const detail = movie.data;

  return (
    <div className="min-h-screen bg-[#080a0e] text-white">
      <div className="relative isolate overflow-hidden border-b border-white/[.08] pt-28">
        {detail.backdrop && <img src={detail.backdrop} alt="" aria-hidden="true" className="absolute inset-0 -z-20 size-full object-cover opacity-25" referrerPolicy="no-referrer" />}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#080a0e_0%,rgba(8,10,14,.9)_45%,rgba(8,10,14,.65)_100%)]" />
        <div className="mx-auto max-w-7xl px-5 pb-14 sm:px-8 lg:px-10">
          <Link to="/#now-playing" className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"><ArrowLeft className="size-4" /> Volver a cartelera</Link>
          <div className="mt-8 grid gap-9 md:grid-cols-[230px_minmax(0,1fr)] lg:grid-cols-[270px_minmax(0,1fr)]">
            <img src={detail.poster} alt={`Póster de ${detail.title}`} className="aspect-[2/3] w-full max-w-[270px] rounded-2xl object-cover shadow-2xl" referrerPolicy="no-referrer" />
            <div className="self-end pb-2"><p className="text-xs font-semibold uppercase tracking-[.28em] text-sky-200">{detail.presale ? 'Preventa disponible' : detail.releaseTag}</p><h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-.045em] sm:text-6xl">{detail.title}</h1><div className="mt-5 flex flex-wrap gap-2">{detail.formats.map((item) => <Badge key={item} className="rounded-full border-white/15 bg-black/30 px-3 py-1.5 text-white">{item}</Badge>)}<Badge className="rounded-full border-white/15 bg-black/30 px-3 py-1.5 text-white">{detail.rating}</Badge><Badge className="rounded-full border-white/15 bg-black/30 px-3 py-1.5 text-white">{detail.duration}</Badge></div><p className="mt-6 max-w-2xl text-base leading-7 text-zinc-200">{detail.synopsis ?? 'La sinopsis estará disponible próximamente.'}</p><p className="mt-5 text-sm text-zinc-400">{detail.genres.join(' · ') || 'Género por confirmar'} · {detail.languages.join(' · ') || 'Idioma por confirmar'}</p></div>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[.25em] text-sky-200">Elige tu función</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.035em] sm:text-4xl">Horarios y sedes</h2></div><p className="max-w-sm text-sm leading-6 text-zinc-400">Selecciona una sede, fecha y horario. Al elegir una función irás directamente a las butacas de su sala.</p></div>
        <div className="mt-9 grid gap-4 rounded-2xl border border-white/[.09] bg-[#101319] p-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <label className="relative block"><span className="mb-2 block text-xs font-medium text-zinc-400">Sede</span><MapPin className="pointer-events-none absolute bottom-3 left-3 size-4 text-sky-200" /><select value={cinemaSlug} onChange={(event) => { setCinemaSlug(event.target.value); setDate(''); }} className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-black/20 pl-10 pr-10 text-sm outline-none focus:border-sky-200/50"><option value="">Selecciona una sede</option>{cinemas.data?.map((cinema) => <option key={cinema.slug} value={cinema.slug}>{cinema.name} · {cinema.district ?? cinema.city}</option>)}</select><ChevronDown className="pointer-events-none absolute bottom-3 right-3 size-4 text-zinc-400" /></label>
          <label className="relative block"><span className="mb-2 block text-xs font-medium text-zinc-400">Formato</span><select value={format} onChange={(event) => setFormat(event.target.value)} className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-black/20 px-3 pr-10 text-sm outline-none focus:border-sky-200/50"><option value="">Todos los formatos</option>{formats.map((item) => <option key={item} value={item}>{formatLabel[item] ?? item}</option>)}</select><ChevronDown className="pointer-events-none absolute bottom-3 right-3 size-4 text-zinc-400" /></label>
        </div>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">{schedule.data?.days.map((item, index) => <button key={item.date} type="button" onClick={() => setDate(item.date)} className={`min-w-28 rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${date === item.date ? 'border-sky-200 bg-sky-200 text-slate-950' : 'border-white/10 bg-white/[.035] text-zinc-200 hover:border-sky-200/35'}`}><span className="block capitalize">{dateLabel(item.date, index === 0)}</span><span className="mt-1 block text-xs opacity-70">{item.date}</span></button>)}</div>
        {selectedCinema && <p className="mt-5 text-sm text-zinc-400">{selectedCinema.address}</p>}
        <div className="mt-8 space-y-6">{schedule.isPending && <p className="text-sm text-zinc-400">Cargando funciones disponibles…</p>}{!schedule.isPending && cinemaSlug && groups.map((group) => <div key={`${group.format}-${group.audioLanguage}`} className="rounded-2xl border border-white/[.08] bg-[#0d1015] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold">{formatLabel[group.format] ?? group.format} · {group.audioLanguage.toLowerCase().startsWith('es') ? 'Doblada' : group.audioLanguage}</h3><span className="text-xs text-zinc-500">Disponibilidad en tiempo real al ingresar</span></div><div className="mt-4 flex flex-wrap gap-2">{group.slots.map((slot) => <Button key={slot.showtimeId} type="button" disabled={!slot.bookable} onClick={() => navigate(`${PATHS.PURCHASE}?showtimeId=${encodeURIComponent(slot.showtimeId)}`)} className="rounded-xl bg-white px-4 text-zinc-950 hover:bg-sky-100 disabled:opacity-40"><Ticket className="size-4" />{slot.localTime}</Button>)}</div></div>)}{!schedule.isPending && cinemaSlug && groups.length === 0 && <div className="rounded-2xl border border-dashed border-white/10 p-7 text-sm text-zinc-400">No hay funciones disponibles para esta combinación. Prueba otra fecha, formato o sede.</div>}</div>
      </section>
    </div>
  );
}

function MovieNotFound() { return <div className="grid min-h-[70vh] place-items-center bg-[#080a0e] px-5 pt-24 text-center text-white"><div><h1 className="text-3xl font-semibold">Película no disponible</h1><Link to={PATHS.HOME}><Button className="mt-6 rounded-xl">Volver al inicio</Button></Link></div></div>; }
function MovieSkeleton() { return <div className="min-h-screen animate-pulse bg-[#080a0e] px-5 pt-32"><div className="mx-auto grid max-w-7xl gap-9 md:grid-cols-[270px_1fr]"><div className="aspect-[2/3] rounded-2xl bg-white/[.07]" /><div className="space-y-5"><div className="h-5 w-36 rounded bg-white/[.07]" /><div className="h-16 max-w-xl rounded bg-white/[.07]" /><div className="h-24 max-w-2xl rounded bg-white/[.07]" /></div></div></div>; }

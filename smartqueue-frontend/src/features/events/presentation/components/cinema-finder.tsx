import { CalendarDays, Clapperboard, MapPin, Search, SlidersHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { CITIES, CINEMAS, HOME_MOVIES } from '@/features/events/data/home.data';

const fields = [
  { label: 'Película', icon: Clapperboard, placeholder: 'Todas las películas', options: HOME_MOVIES.map((movie) => movie.title) },
  { label: 'Ciudad', icon: MapPin, placeholder: 'Todo el país', options: CITIES },
  { label: 'Cine', icon: SlidersHorizontal, placeholder: 'Todos los cines', options: CINEMAS },
  { label: 'Fecha', icon: CalendarDays, placeholder: 'Hoy', options: ['Hoy', 'Mañana', 'Martes 13', 'Miércoles 14'] },
];

export function CinemaFinder() {
  return (
    <section className="relative z-20 mx-auto max-w-7xl px-5 pt-7 lg:px-8 lg:pt-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[.3em] text-sky-200/70">Cartelera nacional</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-.035em] text-white sm:text-4xl">Películas en cartelera</h2>
          <p className="mt-3 text-sm text-zinc-400">Selecciona tu cine y encuentra la función ideal.</p>
        </div>
        <span className="rounded-full border border-sky-200/15 bg-sky-200/[.06] px-4 py-2 text-xs font-semibold text-sky-100">Selección Cinetrux</span>
      </div>

      <Card className="mt-8 border-white/[.08] bg-white/[.035] p-4 shadow-[0_24px_80px_rgba(0,0,0,.32)] sm:p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[repeat(4,1fr)_auto] xl:items-end">
          {fields.map((field) => (
            <label key={field.label} className="block">
              <span className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.15em] text-zinc-500"><field.icon className="size-3.5 text-sky-200/70" />{field.label}</span>
              <Select defaultValue=""><option value="" disabled>{field.placeholder}</option>{field.options.map((option) => <option key={option}>{option}</option>)}</Select>
            </label>
          ))}
          <Button className="h-12 rounded-xl px-7"><Search className="size-4" /> Buscar</Button>
        </div>
      </Card>
    </section>
  );
}

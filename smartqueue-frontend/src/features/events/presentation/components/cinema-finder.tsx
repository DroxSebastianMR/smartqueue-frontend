import { CalendarDays, Clapperboard, MapPin, Search, Store } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { CITIES, CINEMAS, HOME_MOVIES } from '@/features/events/data/home.data';

const fields = [
  { label: 'Por película', icon: Clapperboard, placeholder: '¿Qué quieres ver?', options: HOME_MOVIES.map((movie) => movie.title) },
  { label: 'Por ciudad', icon: MapPin, placeholder: '¿Dónde estás?', options: CITIES },
  { label: 'Por cine', icon: Store, placeholder: 'Elige tu cine', options: CINEMAS },
  { label: 'Por fecha', icon: CalendarDays, placeholder: 'Elige un día', options: ['Hoy', 'Mañana', 'Martes 13', 'Miércoles 14'] },
];

export function CinemaFinder() {
  return (
    <section className="relative z-20 mx-auto -mt-5 max-w-6xl px-5 lg:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,.12)]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[repeat(4,1fr)_auto] xl:items-end">
          {fields.map((field) => <label key={field.label} className="block"><span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#0a3155]"><field.icon className="size-4 text-[#e40046]" />{field.label}</span><Select defaultValue=""><option value="" disabled>{field.placeholder}</option>{field.options.map((option) => <option key={option}>{option}</option>)}</Select></label>)}
          <Button className="h-12 rounded-xl bg-[#e40046] px-7 hover:bg-[#c9003d]"><Search className="size-4" /> Buscar</Button>
        </div>
      </div>
    </section>
  );
}

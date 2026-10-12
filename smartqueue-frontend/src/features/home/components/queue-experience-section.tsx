import { BrainCircuit, Gauge, ScanLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';

const steps = [
  { icon: ScanLine, number: '01', title: 'Toma un turno', description: 'Obtén un token anónimo y una posición única en la cola FIFO.' },
  { icon: BrainCircuit, number: '02', title: 'El sistema anticipa', description: 'El modelo estima riesgo compartido de saturación cada 10 segundos.' },
  { icon: Gauge, number: '03', title: 'Compra con calma', description: 'Cuando llega tu turno recibes un acceso temporal a la compra simulada.' },
];

export function QueueExperienceSection() {
  const navigate = useNavigate();
  return (
    <section className="border-t border-white/[.06] bg-[#0b0d11] py-20 text-white">
      <div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:items-end"><div><p className="text-[11px] font-semibold uppercase tracking-[.3em] text-sky-200/70">La experiencia Cinetrux</p><h2 className="mt-3 text-4xl font-semibold leading-tight tracking-[-.045em]">Menos espera.<br />Más cine.</h2><p className="mt-5 max-w-md leading-7 text-zinc-400">La inteligencia artificial no decide quién entra primero; solo ayuda a mantener estable el proceso.</p><Button className="mt-7 rounded-full" onClick={() => navigate('/monitoring')}>Explorar la experiencia</Button></div><div className="grid gap-4 sm:grid-cols-3">{steps.map((step) => <article key={step.number} className="rounded-2xl border border-white/[.08] bg-white/[.035] p-6"><div className="flex items-center justify-between"><step.icon className="size-6 text-sky-200/75" /><span className="text-xs font-black text-white/20">{step.number}</span></div><h3 className="mt-8 text-lg font-bold">{step.title}</h3><p className="mt-2 text-sm leading-6 text-zinc-500">{step.description}</p></article>)}</div></div></div>
    </section>
  );
}

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
    <section className="bg-[#081d35] py-16 text-white">
      <div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:items-end"><div><p className="text-sm font-bold uppercase tracking-[.2em] text-[#ff3d78]">La experiencia SmartQueue</p><h2 className="mt-3 text-4xl font-black leading-tight tracking-[-.045em]">Menos ansiedad.<br />Más cine.</h2><p className="mt-5 max-w-md leading-7 text-slate-400">La inteligencia artificial no decide quién entra primero; solo ayuda a mantener estable el proceso.</p><Button className="mt-7 rounded-full bg-[#e40046]" onClick={() => navigate('/monitoring')}>Explorar el experimento</Button></div><div className="grid gap-4 sm:grid-cols-3">{steps.map((step) => <article key={step.number} className="rounded-2xl border border-white/10 bg-white/[.05] p-6"><div className="flex items-center justify-between"><step.icon className="size-6 text-[#ff3d78]" /><span className="text-xs font-black text-white/25">{step.number}</span></div><h3 className="mt-8 text-lg font-bold">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{step.description}</p></article>)}</div></div></div>
    </section>
  );
}

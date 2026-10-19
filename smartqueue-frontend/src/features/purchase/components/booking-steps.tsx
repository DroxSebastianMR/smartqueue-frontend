import { Armchair, Check, CreditCard, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [{ label: 'Butacas', icon: Armchair }, { label: 'Entradas', icon: Ticket }, { label: 'Pago', icon: CreditCard }];
export function BookingSteps({ current }: { current: number }) {
  return <nav aria-label="Progreso de compra" className="mx-auto max-w-lg"><ol className="flex items-start">
    {steps.map(({ label, icon: Icon }, index) => <li key={label} className="relative flex flex-1 flex-col items-center gap-2" aria-current={current === index ? 'step' : undefined}>
      {index < steps.length - 1 && <span aria-hidden className={cn('absolute left-1/2 top-5 h-px w-full', current > index ? 'bg-sky-200/60' : 'bg-white/10')} />}
      <span className={cn('relative grid size-10 place-items-center rounded-full border transition-colors duration-300', index < current ? 'border-sky-200 bg-sky-200 text-slate-950' : index === current ? 'border-sky-200/60 bg-[#16232c] text-sky-100 shadow-[0_0_20px_#bae6fd12]' : 'border-white/10 bg-[#101216] text-zinc-600')}>
        {index < current ? <Check className="size-4" /> : <Icon className="size-4" />}
      </span><span className={cn('text-xs font-medium', index <= current ? 'text-zinc-200' : 'text-zinc-600')}>{label}</span>
    </li>)}
  </ol></nav>;
}

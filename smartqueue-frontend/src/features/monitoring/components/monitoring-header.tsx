import { BrainCircuit } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

export function MonitoringHeader({ meta, status, mode }: { meta: { eyebrow: string; title: string; description: string }; status: { label: string; tone: string }; mode: { label: string } }) {
  const statusTone = status.tone === 'success' ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-200' : status.tone === 'info' ? 'border-sky-300/20 bg-sky-300/10 text-sky-100' : 'border-rose-300/20 bg-rose-300/10 text-rose-100';
  return <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-sky-300">{meta.eyebrow}</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">{meta.title}</h1><p className="mt-2 max-w-2xl text-sm text-slate-400">{meta.description}</p></div><div className="flex flex-wrap items-center gap-2"><Badge className={`border px-3 py-2 ${statusTone}`}><span className="mr-2 size-1.5 rounded-full bg-current" />{status.label}</Badge><Badge className="border border-sky-300/20 bg-sky-300/10 px-3 py-2 text-sky-100"><BrainCircuit className="mr-2 size-4" />{mode.label}</Badge></div></section>;
}

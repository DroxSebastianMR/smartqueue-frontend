import { GraduationCap, ShieldCheck } from 'lucide-react';

import { Card } from '@/components/ui/card';

export function ProjectNotice() {
  return (
    <section className="bg-[#08090c] px-5 py-16 lg:px-8">
      <Card className="mx-auto grid max-w-7xl overflow-hidden border-sky-200/10 bg-[radial-gradient(circle_at_85%_20%,rgba(125,190,255,.16),transparent_34%),linear-gradient(120deg,#10141a,#090b0f)] text-white lg:grid-cols-[1fr_auto]">
        <div className="p-8 sm:p-10"><GraduationCap className="size-9 text-sky-200" /><h2 className="mt-5 text-3xl font-semibold tracking-tight">Una preventa para aprender, medir y comparar.</h2><p className="mt-3 max-w-2xl leading-7 text-zinc-400">Todo el contenido es ficticio. El proyecto evalúa control fijo, reactivo y predictivo bajo las mismas condiciones experimentales.</p></div>
        <div className="flex items-center gap-3 border-t border-white/10 bg-white/[.025] px-8 py-6 lg:border-l lg:border-t-0"><ShieldCheck className="size-6 text-sky-200" /><span className="text-sm font-bold">Sin pagos reales<br /><small className="font-normal text-zinc-500">Sin datos personales</small></span></div>
      </Card>
    </section>
  );
}

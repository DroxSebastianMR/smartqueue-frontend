import { GraduationCap, ShieldCheck } from 'lucide-react';

export function ProjectNotice() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8"><div className="grid overflow-hidden rounded-[28px] bg-gradient-to-r from-[#e40046] to-[#a90049] text-white lg:grid-cols-[1fr_auto]"><div className="p-8 sm:p-10"><GraduationCap className="size-9 text-pink-100" /><h2 className="mt-5 text-3xl font-black tracking-tight">Una preventa para aprender, medir y comparar.</h2><p className="mt-3 max-w-2xl leading-7 text-pink-100/80">Todo el contenido es ficticio. El proyecto evalúa control fijo, reactivo y predictivo bajo las mismas condiciones experimentales.</p></div><div className="flex items-center gap-3 border-t border-white/15 bg-black/10 px-8 py-6 lg:border-l lg:border-t-0"><ShieldCheck className="size-6" /><span className="text-sm font-bold">Sin pagos reales<br /><small className="font-normal text-pink-100/70">Sin datos personales</small></span></div></div></section>
  );
}

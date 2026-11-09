import { Card } from '@/components/ui/card';

export function AdminStatCard({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: React.ReactNode }) {
  return <Card className="border-slate-700/70 bg-[#0b1524]/90 p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-3xl font-bold text-white">{value}</p></div><span className="grid size-10 place-items-center rounded-xl bg-sky-400/10 text-sky-200 [&>svg]:size-5">{icon}</span></div><p className="mt-4 text-xs leading-5 text-slate-500">{detail}</p></Card>;
}

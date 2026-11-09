import { Card } from '@/components/ui/card';

export function MonitoringEmptyState({ title, message }: { title: string; message: string }) {
  return <div className="mx-auto max-w-3xl px-5 py-20"><Card className="p-10 text-center"><h1 className="text-2xl font-bold text-white">{title}</h1><p className="mt-3 text-slate-400">{message}</p></Card></div>;
}

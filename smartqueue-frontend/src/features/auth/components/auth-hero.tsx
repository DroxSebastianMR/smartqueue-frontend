import { Ticket } from 'lucide-react';

interface AuthHeroProps { eyebrow: string; title: string; description: string }

export function AuthHero({ eyebrow, title, description }: AuthHeroProps) {
  return (
    <aside className="hidden flex-col justify-center lg:flex">
      <div className="mb-8 inline-flex size-14 items-center justify-center rounded-2xl border border-sky-100/15 bg-sky-100/5 text-sky-100"><Ticket className="size-7" /></div>
      <p className="text-xs font-semibold uppercase tracking-[.32em] text-sky-100/70">{eyebrow}</p>
      <h1 className="mt-4 max-w-md text-5xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-5 max-w-md text-lg leading-8 text-zinc-400">{description}</p>
    </aside>
  );
}

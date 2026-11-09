export function AdminPageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: React.ReactNode }) {
  return <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-sky-300">{eyebrow}</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm text-slate-400">{description}</p></div>{actions}</header>;
}

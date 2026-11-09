export const adminStyles = {
  page: 'mx-auto max-w-[1920px] space-y-5 px-4 py-5 md:px-5 lg:px-7 lg:py-6',
  panel: 'overflow-hidden rounded-2xl border border-slate-700/70 bg-[#0c1424] shadow-[inset_0_1px_0_rgba(255,255,255,.035)]',
  actionButton: 'inline-flex items-center gap-2 rounded-lg bg-sky-400 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-[0_0_16px_rgba(56,189,248,.2)] transition hover:bg-sky-300',
  technicalLabel: 'font-mono text-[10px] font-bold uppercase tracking-[.13em] text-slate-500',
  field: 'mt-1.5 h-11 w-full rounded-lg border border-slate-700 bg-[#0a0e16] px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/15',
} as const;

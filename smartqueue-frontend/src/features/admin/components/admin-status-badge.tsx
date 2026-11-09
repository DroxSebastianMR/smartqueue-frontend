import { Circle } from 'lucide-react';

import type { MoviePublicationStatus } from '@/features/admin/types/admin-movie.types';

const config: Record<MoviePublicationStatus, { label: string; className: string }> = {
  PUBLISHED: { label: 'Publicada', className: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300' },
  DRAFT: { label: 'Borrador', className: 'border-amber-400/25 bg-amber-400/10 text-amber-200' },
  ARCHIVED: { label: 'Archivada', className: 'border-rose-400/25 bg-rose-400/10 text-rose-300' },
};

export function AdminStatusBadge({ status }: { status: MoviePublicationStatus }) {
  const item = config[status];
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[.08em] ${item.className}`}><Circle className="size-1.5 fill-current" />{item.label}</span>;
}

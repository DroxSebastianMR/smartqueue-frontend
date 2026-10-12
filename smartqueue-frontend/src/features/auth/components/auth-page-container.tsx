import type { PropsWithChildren } from 'react';
import { Card } from '@/components/ui/card';

export function AuthPageContainer({ children }: PropsWithChildren) {
  return <Card className="w-full max-w-md justify-self-center border-white/10 bg-[#111419]/95 p-6 text-white sm:p-9">{children}</Card>;
}

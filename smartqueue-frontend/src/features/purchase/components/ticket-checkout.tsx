import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, CreditCard, Minus, Plus, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ticketPricingService } from '@/infrastructure/api/purchase/services/ticket-pricing.service';
import { TicketCategory, type PaymentMethodCode } from '../types/ticket-pricing.types';
import { formatMoney } from './booking-summary';

interface Props {
  showtimeId: string;
  seatIds: string[];
  onEdit: () => void;
  onQuote: (total: number | null) => void;
  onPayment: (active: boolean) => void;
}

export function TicketCheckout({ showtimeId, seatIds, onEdit, onQuote, onPayment }: Props) {
  const [quantities, setQuantities] = useState<Partial<Record<TicketCategory, number>>>({});
  const [payment, setPayment] = useState(false);
  const [method, setMethod] = useState<PaymentMethodCode | null>(null);
  const rates = useQuery({ queryKey: ['ticket-rates', showtimeId], queryFn: () => ticketPricingService.rates(showtimeId) });
  const methods = useQuery({ queryKey: ['payment-methods'], queryFn: ticketPricingService.paymentMethods, enabled: payment });
  const totalQuantity = Object.values(quantities).reduce((sum, n) => sum + (n ?? 0), 0);
  const quote = useMutation({
    mutationFn: () => ticketPricingService.quote(showtimeId, seatIds, Object.entries(quantities).filter(([, quantity]) => quantity > 0).map(([category, quantity]) => ({ category: category as TicketCategory, quantity }))),
    onSuccess: (data) => { onQuote(data.totalCents); setPayment(true); onPayment(true); },
  });
  const estimate = rates.data?.rates.reduce((sum, rate) => sum + rate.unitPriceCents * (quantities[rate.category] ?? 0), 0) ?? 0;

  return <Card className="border-white/10 bg-[#101318] p-5 sm:p-8">
    <h2 className="text-xl font-semibold">{payment ? 'Elige cómo pagar' : 'Entradas a tu medida'}</h2>
    <p className="mt-2 text-sm leading-6 text-zinc-400">{payment ? 'Revisa tu cotización y los medios de pago previstos.' : `Asigna una entrada a cada una de tus ${seatIds.length} butacas.`}</p>
    {!payment ? <>
      {rates.isPending && <p role="status" className="py-8 text-sm text-zinc-400">Consultando tarifas…</p>}
      {rates.isError && <div role="alert" className="py-5 text-sm text-zinc-400">No pudimos cargar las tarifas. <Button variant="ghost" onClick={() => void rates.refetch()}>Reintentar</Button></div>}
      <div className="mt-5 divide-y divide-white/10">{rates.data?.rates.map((rate) => <div key={rate.category} className="flex flex-wrap items-center justify-between gap-4 py-5">
        <div className="max-w-xs"><h3 className="font-medium">{rate.label} <span className="ml-2 text-sky-100">{formatMoney(rate.unitPriceCents, rates.data.currency)}</span></h3><p className="mt-1 text-xs leading-5 text-zinc-500">{rate.description}</p></div>
        <div className="flex items-center gap-4"><Button size="icon" variant="outline" aria-label={`Quitar entrada ${rate.label}`} disabled={!quantities[rate.category] || quote.isPending} onClick={() => setQuantities((value) => ({ ...value, [rate.category]: (value[rate.category] ?? 0) - 1 }))}><Minus className="size-4" /></Button><span className="w-4 text-center tabular-nums" aria-live="polite">{quantities[rate.category] ?? 0}</span><Button size="icon" variant="outline" aria-label={`Añadir entrada ${rate.label}`} disabled={totalQuantity >= seatIds.length || quote.isPending} onClick={() => setQuantities((value) => ({ ...value, [rate.category]: (value[rate.category] ?? 0) + 1 }))}><Plus className="size-4" /></Button></div>
      </div>)}</div>
      {rates.data && <div className="mt-4 flex justify-between border-t border-white/10 pt-5 text-sm"><span className="text-zinc-400">{totalQuantity} / {seatIds.length} entradas · Estimado</span><strong>{formatMoney(estimate, rates.data.currency)}</strong></div>}
      <p className="mt-4 text-xs leading-5 text-zinc-500">Tarifas de demostración. El precio se verifica en el servidor al continuar; las butacas aún no están reservadas.</p>
      {quote.isError && <p role="alert" className="mt-4 text-sm text-amber-100">No se pudo validar la cotización. Revisa las butacas y vuelve a intentar.</p>}
      <div className="mt-7 flex flex-wrap justify-between gap-3"><Button variant="ghost" onClick={onEdit} disabled={quote.isPending}><ArrowLeft className="size-4" />Butacas</Button><Button onClick={() => quote.mutate()} disabled={!rates.data || totalQuantity !== seatIds.length || quote.isPending}>{quote.isPending ? 'Verificando…' : 'Continuar al pago'}<ArrowRight className="size-4" /></Button></div>
    </> : <>
      <div className="my-6 space-y-3 border-y border-white/10 py-5">{quote.data?.lines.map((line) => <div key={line.category} className="flex justify-between text-sm text-zinc-300"><span>{line.quantity} × {line.label}</span><span>{formatMoney(line.subtotalCents, quote.data.currency)}</span></div>)}</div>
      {methods.isPending && <p role="status" className="text-sm text-zinc-400">Consultando métodos de pago…</p>}
      {methods.isError && <Button variant="outline" onClick={() => void methods.refetch()}>Reintentar métodos de pago</Button>}
      <fieldset className="space-y-3"><legend className="sr-only">Método de pago previsto</legend>{methods.data?.data.map((item) => <label key={item.code} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${method === item.code ? 'border-sky-200/50 bg-sky-200/5' : 'border-white/10'}`}><input type="radio" name="payment-method" value={item.code} checked={method === item.code} onChange={() => setMethod(item.code)} className="accent-sky-200" /><CreditCard className="size-4 text-zinc-400" /><span className="flex-1 text-sm">{item.label}</span><span className="text-[10px] text-zinc-500">Próximamente</span></label>)}</fieldset>
      <div className="mt-6 rounded-xl border border-sky-200/15 bg-sky-200/5 p-4"><p className="flex items-center gap-2 text-sm text-sky-100"><ShieldCheck className="size-4" />Integración de pagos pendiente</p><p className="mt-2 text-xs leading-5 text-zinc-400">Puedes explorar los métodos. Aún no se bloquean butacas ni se realizan cobros. No ingreses datos bancarios.</p></div>
      <div className="mt-6 flex flex-wrap justify-between gap-3"><Button variant="ghost" onClick={() => { setPayment(false); onPayment(false); onQuote(null); }}><ArrowLeft className="size-4" />Modificar entradas</Button><Button disabled>Pagar · Próximamente</Button></div>
    </>}
  </Card>;
}

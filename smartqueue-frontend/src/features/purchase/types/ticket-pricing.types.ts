export enum TicketCategory { GENERAL = 'GENERAL', CHILD = 'CHILD', SENIOR = 'SENIOR' }
export enum PaymentMethodCode { CARD = 'CARD', PREPAID_CARD = 'PREPAID_CARD', YAPE = 'YAPE', PAGOEFECTIVO = 'PAGOEFECTIVO', BANK_TRANSFER = 'BANK_TRANSFER', CASH = 'CASH', CARD_TERMINAL = 'CARD_TERMINAL' }
export interface TicketRate { category: TicketCategory; label: string; description: string; unitPriceCents: number }
export interface TicketRates { currency: string; policy: string; rates: TicketRate[] }
export interface TicketQuantity { category: TicketCategory; quantity: number }
export interface TicketQuote { showtimeId: string; currency: string; totalCents: number; reserved: boolean; lines: (TicketRate & { quantity: number; subtotalCents: number })[] }
export interface PaymentMethods { readyForCheckout: boolean; data: { code: PaymentMethodCode; label: string; availability: string; provider: string | null }[] }

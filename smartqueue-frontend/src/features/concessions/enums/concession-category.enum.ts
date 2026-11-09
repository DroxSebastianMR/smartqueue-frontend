export enum ConcessionCategory {
  COMBO = 'COMBO',
  POPCORN = 'POPCORN',
  BEVERAGE = 'BEVERAGE',
  SNACK = 'SNACK',
  CANDY = 'CANDY',
}

export const CONCESSION_CATEGORY_LABELS: Record<ConcessionCategory, string> = {
  [ConcessionCategory.COMBO]: 'Combos',
  [ConcessionCategory.POPCORN]: 'Canchita',
  [ConcessionCategory.BEVERAGE]: 'Bebidas',
  [ConcessionCategory.SNACK]: 'Snacks',
  [ConcessionCategory.CANDY]: 'Dulces',
};

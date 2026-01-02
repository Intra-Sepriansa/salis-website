export type LeadTime = 'ready' | 'preorder_h1' | 'preorder_h2'
export function leadTimeLabel(lt: LeadTime) {
  switch (lt) {
    case 'ready': return 'Ready stock'
    case 'preorder_h1': return 'Pre-order H+1'
    case 'preorder_h2': return 'Pre-order H+2'
  }
}
export function canSell(stock: number, lt: LeadTime) {
  if (lt === 'ready') return stock > 0
  return true
}

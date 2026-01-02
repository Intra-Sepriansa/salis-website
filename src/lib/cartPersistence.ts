import type { CartItem } from '../types'

const KEY = 'salis-cart'
const EMAIL_KEY = 'salis-cart-email'

export function saveCart(items: CartItem[]) {
  try { localStorage.setItem(KEY, JSON.stringify(items)) } catch {}
}
export function loadCart(): CartItem[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}
export function clearSavedCart() {
  try { localStorage.removeItem(KEY) } catch {}
}

export function saveCartEmail(email: string) {
  try { localStorage.setItem(EMAIL_KEY, email) } catch {}
}
export function loadCartEmail(): string | undefined {
  try { return localStorage.getItem(EMAIL_KEY) ?? undefined } catch { return }
}

export type ReferralProfile = {
  code: string
  ownerName: string
  credit: number
  totalUses: number
  active: boolean
  createdAt: number
}

const KEY = 'salis-referral-codes'
const CLICK_KEY = 'salis-referral-click'

export function loadReferrals(): ReferralProfile[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}
export function saveReferrals(list: ReferralProfile[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch {}
}
export function getReferralByCode(code: string) {
  const list = loadReferrals()
  return list.find(x => x.code.toUpperCase() === code.toUpperCase())
}
export function upsertReferral(p: ReferralProfile) {
  const list = loadReferrals()
  const idx = list.findIndex(x => x.code.toUpperCase() === p.code.toUpperCase())
  if (idx >= 0) list[idx] = p; else list.unshift(p)
  saveReferrals(list)
}
export function recordClick(code: string) {
  try { localStorage.setItem(CLICK_KEY, code) } catch {}
}
export function getClickedCode(): string | undefined {
  try { return localStorage.getItem(CLICK_KEY) ?? undefined } catch { return }
}

export function applyReferral(code: string, total: number) {
  const buyerDiscount = Math.floor(total * 0.05)
  const refCredit = Math.floor(total * 0.03)
  const profile = getReferralByCode(code)
  if (!profile || !profile.active) return { discount: 0, credit: 0 }
  profile.credit += refCredit
  profile.totalUses += 1
  upsertReferral(profile)
  return { discount: buyerDiscount, credit: refCredit }
}

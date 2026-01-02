export type Campaign = {
  id: string
  title: string
  from: string // 'YYYY-MM-DD'
  to: string   // 'YYYY-MM-DD'
  voucherCode?: string
  banner?: string
}

export const CAMPAIGNS: Campaign[] = [
  { id: 'payday', title: 'Payday Sale 25–1', from: '2025-09-25', to: '2025-10-01', voucherCode: 'PAYDAY', banner: '/assets/campaigns/payday.png' },
]

function parse(d: string) {
  const [y, m, g] = d.split('-').map(Number)
  return new Date(y, m - 1, g).getTime()
}
export function isCampaignActive(c: Campaign, now = Date.now()) {
  return now >= parse(c.from) && now <= parse(c.to)
}
export function getActiveCampaigns(now = Date.now()) {
  return CAMPAIGNS.filter(c => isCampaignActive(c, now))
}

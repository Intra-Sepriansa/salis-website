import { useEffect } from 'react'
import { recordClick } from '../lib/referral'
import { FLAGS } from '../lib/flags'

export function useReferralCapture() {
  useEffect(() => {
    if (!FLAGS.enableReferralCapture) return
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) recordClick(ref)
  }, [])
}

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

const scrollThreshold = 420

const getReduceMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function BackToTopFab() {
  const [visible, setVisible] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(getReduceMotion())

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > scrollThreshold)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = () => setReduceMotion(media.matches)
    handler()
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  const handleClick = () => {
    if (reduceMotion) {
      window.scrollTo({ top: 0 })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <button
      type='button'
      onClick={handleClick}
      aria-label='Kembali ke atas'
      className={`fixed bottom-6 right-6 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] shadow-soft transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] ${visible ? 'opacity-100 translate-y-0' : 'pointer-events-none translate-y-4 opacity-0'}`}
    >
      <ArrowUp className='h-5 w-5' />
    </button>
  )
}

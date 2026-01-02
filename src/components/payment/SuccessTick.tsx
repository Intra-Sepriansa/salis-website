import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export type SuccessTickProps = {
  duration?: number
}

export function SuccessTick({ duration = 900 }: SuccessTickProps) {
  const prefersReducedMotion = useReducedMotion()
  const [completed, setCompleted] = useState(prefersReducedMotion)

  useEffect(() => {
    if (prefersReducedMotion) {
      setCompleted(true)
      return
    }
    const timer = window.setTimeout(() => setCompleted(true), duration)
    return () => window.clearTimeout(timer)
  }, [duration, prefersReducedMotion])

  return (
    <motion.div
      role='status'
      aria-live='polite'
      className='flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 shadow-soft'
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
    >
      {completed ? (
        <motion.svg
          key='tick'
          width='36'
          height='36'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ type: 'spring', duration: prefersReducedMotion ? 0 : 0.6, bounce: 0 }}
        >
          <path d='M20 6L9 17l-5-5' />
        </motion.svg>
      ) : (
        <motion.span
          key='spinner'
          className='block h-10 w-10 rounded-full border-4 border-emerald-400/60 border-t-emerald-500'
          animate={prefersReducedMotion ? { opacity: [0.4, 0.9] } : { rotate: 360 }}
          transition={prefersReducedMotion ? { repeat: Infinity, duration: 1.4, ease: 'easeInOut' } : { repeat: Infinity, duration: 0.9, ease: 'linear' }}
        />
      )}
    </motion.div>
  )
}

export default SuccessTick

import { type ElementType, type ReactNode, useMemo, useRef } from 'react'
import { motion, type MotionProps, useInView, type Variants } from 'framer-motion'
import { fadeUp } from '../../lib/animations'

export type RevealProps = MotionProps & {
  children: ReactNode
  as?: ElementType
  className?: string
  delay?: number
  variants?: Variants
  once?: boolean
}

export function Reveal({
  children,
  as: Component = 'div',
  className,
  delay = 0,
  variants = fadeUp,
  once = true,
  transition,
  ...motionProps
}: RevealProps) {
  const innerRef = useRef<HTMLElement | null>(null)
  const MotionComponent = useMemo(() => motion(Component as ElementType), [Component])
  const isInView = useInView(innerRef, { once, amount: 0.2 })

  return (
    <MotionComponent
      ref={innerRef as any}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{ delay, ...(transition ?? {}) }}
      className={className}
      {...motionProps}
    >
      {children}
    </MotionComponent>
  )
}

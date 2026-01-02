import clsx from 'clsx'
import { ElementType, ReactNode } from 'react'
import { onBg } from '../lib/colors'

type TextContrastProps<T extends ElementType = 'span'> = {
  background: string
  children: ReactNode
  className?: string
  as?: T
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'color'>

export function TextContrast<T extends ElementType = 'span'>({
  background,
  children,
  className,
  as,
  ...props
}: TextContrastProps<T>) {
  const Component = (as ?? 'span') as ElementType
  const color = onBg(background)

  return (
    <Component className={clsx(className)} style={{ color }} {...props}>
      {children}
    </Component>
  )
}

export default TextContrast

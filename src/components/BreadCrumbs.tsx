import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import clsx from 'clsx'

export type BreadcrumbItem = {
  label: string
  to?: string
}

export function BreadCrumbs({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav className={clsx('flex items-center gap-2 text-sm text-[var(--fg)]/70', className)} aria-label='Breadcrumb'>
      {items.map((item, index) => (
        <Fragment key={item.label}>
          {item.to ? (
            <Link to={item.to} className='transition hover:text-[var(--primary-foreground)]'>
              {item.label}
            </Link>
          ) : (
            <span className='font-medium text-[var(--fg)]'>{item.label}</span>
          )}
          {index < items.length - 1 && <ChevronRight className='h-4 w-4 text-[var(--fg)]/40' />}
        </Fragment>
      ))}
    </nav>
  )
}

export default BreadCrumbs

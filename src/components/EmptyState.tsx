import { Link } from 'react-router-dom'
import { PackageSearch } from 'lucide-react'
import clsx from 'clsx'

export type EmptyStateProps = {
  title: string
  description?: string
  actionLabel?: string
  actionTo?: string
  className?: string
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center gap-4 rounded-3xl border border-dashed border-[var(--border)] bg-white/95 px-8 py-14 text-center shadow-[var(--shadow-soft)] backdrop-blur',
        className
      )}
    >
      <PackageSearch className="h-12 w-12 text-[var(--primary)]" aria-hidden />
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-[var(--fg)]">{title}</h3>
        {description && <p className="text-sm text-[var(--muted-foreground)]">{description}</p>}
      </div>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="inline-flex items-center rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm transition hover:brightness-110"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}

export default EmptyState

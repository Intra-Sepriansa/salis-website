import clsx from 'clsx'
import type { Category } from '../types'
import { categories } from '../data/categories'

type CategoryPillsProps = {
  active?: Category | 'all'
  onSelect?: (category: Category | 'all') => void
  showAll?: boolean
  className?: string
}

export function CategoryPills({ active = 'all', onSelect, showAll = true, className }: CategoryPillsProps) {
  const handleSelect = (category: Category | 'all') => () => onSelect?.(category)

  const baseClass = 'pill transition-colors'

  return (
    <div className={clsx('flex flex-wrap gap-2', className)}>
      {showAll && (
        <button
          type="button"
          onClick={handleSelect('all')}
          className={clsx(
            baseClass,
            active === 'all'
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm'
              : 'text-[var(--muted-foreground)] hover:text-[var(--fg)]'
          )}
        >
          Semua
        </button>
      )}
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={handleSelect(category.id)}
          className={clsx(
            baseClass,
            active === category.id
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm'
              : 'text-[var(--muted-foreground)] hover:text-[var(--fg)]'
          )}
        >
          {category.label}
        </button>
      ))}
    </div>
  )
}

export default CategoryPills

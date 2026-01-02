import { Search } from 'lucide-react'
import clsx from 'clsx'
import { FormEvent, useState } from 'react'

export type SearchBarProps = {
  placeholder?: string
  defaultValue?: string
  onSearch?: (query: string) => void
  className?: string
  autoFocus?: boolean
}

export function SearchBar({
  placeholder = 'Cari produk favoritmu...',
  defaultValue = '',
  onSearch,
  className,
  autoFocus,
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearch?.(value)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={clsx(
        'group relative flex h-12 w-full max-w-2xl items-center rounded-full border border-[var(--border)] bg-white/85 px-4 shadow-sm transition focus-within:border-[var(--primary)] focus-within:bg-white focus-within:shadow-md',
        className
      )}
    >
      <Search className="mr-3 h-4 w-4 text-[var(--muted-foreground)] transition group-focus-within:text-[var(--primary)]" />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex-1 bg-transparent text-sm text-[var(--fg)] outline-none placeholder:text-[var(--muted-foreground)]"
      />
      <button
        type="submit"
        className="ml-3 inline-flex items-center rounded-full bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-[var(--primary-foreground)] shadow-sm transition hover:brightness-110"
      >
        Cari
      </button>
    </form>
  )
}

export default SearchBar

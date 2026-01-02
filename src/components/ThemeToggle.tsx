import { Moon, Sun } from 'lucide-react'
import clsx from 'clsx'
import { useUserStore } from '../store/user'

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useUserStore((state) => state.theme)
  const toggleTheme = useUserStore((state) => state.toggleTheme)

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={clsx(
        'inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/80 text-[var(--muted-foreground)] shadow-sm transition hover:text-[var(--primary)] dark:border-[var(--border)] dark:bg-[var(--bg-elevated)]',
        className
      )}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )
}

export default ThemeToggle

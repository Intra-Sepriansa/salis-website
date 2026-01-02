import { Outlet } from 'react-router-dom'
export default function MinimalLayout() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <main className="container-p py-10">
        <Outlet />
      </main>
    </div>
  )
}

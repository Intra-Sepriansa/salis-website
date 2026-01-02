// src/components/admin/pages/Login.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../store/auth'

export default function Login() {
  const navigate = useNavigate()
  const { session, loading, error, login } = useAdminAuth()
  const [email, setEmail] = useState('admin@salis.shop')
  const [password, setPassword] = useState('admin123')
  const [remember, setRemember] = useState(true)
  const [show, setShow] = useState(false)
  const [caps, setCaps] = useState(false)

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // caps lock indikator
    setCaps(e.getModifierState?.('CapsLock') ?? false)
  }

  useEffect(() => {
    if (session) navigate('/admin', { replace: true })
  }, [session, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, password, remember)
    // redirect dipicu oleh effect di atas saat session set
  }

  const border = useMemo(
    () => 'ring-1 ring-white/40 border border-white/30 backdrop-blur bg-white/20 dark:bg-white/10',
    []
  )

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-fuchsia-500 via-violet-500 to-orange-400 dark:from-zinc-900 dark:via-zinc-900 dark:to-black">
      {/* progress bar tipis di top saat loading */}
      {loading && <div className="fixed left-0 top-0 h-0.5 w-full animate-pulse bg-white/80" />}

      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-10 px-6 py-12 md:grid-cols-2">
        {/* Kiri: form */}
        <form
          onSubmit={handleSubmit}
          className={`mx-auto w-full max-w-md rounded-3xl p-8 text-white shadow-2xl ${border}`}
        >
          <div className="mb-6">
            <h1 className="text-3xl font-semibold">Salis Admin</h1>
            <p className="text-white/80">Masuk untuk mengelola toko.</p>
          </div>

          <label className="mb-4 block text-sm">
            <span className="mb-1 block">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyUp={onKey}
              required
              className="w-full rounded-xl border border-white/30 bg-white/20 px-3 py-2 text-white placeholder-white/60 outline-none backdrop-blur focus:border-white/60"
              placeholder="you@domain.com"
            />
          </label>

          <label className="mb-2 block text-sm">
            <span className="mb-1 block">Password</span>
            <div className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/20 px-3 py-2 backdrop-blur focus-within:border-white/60">
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={onKey}
                required
                className="w-full bg-transparent text-white placeholder-white/60 outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                aria-label="Tampilkan password"
                onClick={() => setShow((s) => !s)}
                className="rounded-lg bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
              >
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          <div className="mb-4 flex items-center justify-between text-xs">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-white/40 bg-white/10"
              />
              Ingat saya
            </label>
            <a className="cursor-pointer text-white/80 underline-offset-4 hover:underline">
              Lupa password?
            </a>
          </div>

          {caps && (
            <p className="mb-3 rounded-lg bg-yellow-300/20 px-3 py-2 text-xs text-yellow-100">
              Caps Lock aktif
            </p>
          )}

          {error && (
            <p className="mb-3 rounded-lg bg-red-500/20 px-3 py-2 text-xs text-red-100">
              {error}
            </p>
          )}

          {/* dummy reCAPTCHA */}
          <div className="mb-4 rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-center text-[10px] uppercase tracking-widest text-white/70">
            reCAPTCHA (dummy)
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mb-3 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-violet-700 shadow hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Memproses…' : 'Masuk'}
          </button>

          <button
            type="button"
            disabled={loading}
            className="w-full rounded-2xl border border-white/40 bg-transparent px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
            onClick={() => alert('Magic link dikirim (simulasi)')}
          >
            Kirim Magic Link (demo)
          </button>

          <p className="mt-4 text-center text-[11px] text-white/70">
            Tip: Cmd/Ctrl + K untuk Command Palette di dalam panel admin.
          </p>
        </form>

        {/* Kanan: ilustrasi sederhana (tanpa asset eksternal agar plug-n-play) */}
        <div className="mx-auto hidden w-full max-w-md md:block">
          <div className={`aspect-[4/3] w-full rounded-3xl ${border} p-6`}>
            <div className="h-full w-full rounded-2xl bg-gradient-to-tr from-white/20 to-white/5" />
            <div className="mt-4 text-center text-white/90">
              <p className="text-lg font-medium">Monitoring yang elegan</p>
              <p className="text-sm text-white/70">
                Revenue, Orders, AOV, Funnel, Payment Mix — semua di satu tempat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

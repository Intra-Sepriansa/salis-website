import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAdminAuthStore } from '../../store/adminAuth'

const messages = {
  title: 'Login Admin',
  subtitle: 'Gunakan kredensial demo untuk mengakses dashboard.',
}

type LoginForm = {
  email: string
  password: string
}

export default function AdminLogin() {
  const login = useAdminAuthStore((state) => state.login)
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const form = useForm<LoginForm>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const handleSubmit = form.handleSubmit((values) => {
    const success = login(values.email, values.password)
    if (!success) {
      setError('Email atau kata sandi tidak cocok.')
      return
    }
    const redirectTo = (location.state as { from?: string } | null)?.from ?? '/admin'
    navigate(redirectTo, { replace: true })
  })

  return (
    <div className='flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 py-16'>
      <form
        onSubmit={handleSubmit}
        className='w-full max-w-md space-y-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-soft'
      >
        <div className='space-y-2 text-center'>
          <h1 className='text-2xl font-semibold text-[var(--fg)]'>{messages.title}</h1>
          <p className='text-sm text-[var(--muted-foreground)]'>{messages.subtitle}</p>
        </div>
        <div className='space-y-4'>
          <label className='space-y-1 text-sm text-[var(--muted-foreground)]'>
            <span className='font-semibold text-[var(--fg)]'>Email</span>
            <input
              type='email'
              {...form.register('email', { required: true })}
              className='w-full rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none'
              placeholder='admin@salis.id'
            />
          </label>
          <label className='space-y-1 text-sm text-[var(--muted-foreground)]'>
            <span className='font-semibold text-[var(--fg)]'>Kata sandi</span>
            <input
              type='password'
              {...form.register('password', { required: true })}
              className='w-full rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none'
              placeholder='Masukkan Password'
            />
          </label>
          {error && <p className='text-sm text-red-500'>{error}</p>}
        </div>
        <button
          type='submit'
          disabled={form.formState.isSubmitting}
          className='inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-soft transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60'
        >
          Masuk
        </button>
      </form>
    </div>
  )
}

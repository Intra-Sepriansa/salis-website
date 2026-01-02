import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuthStore } from '../../store/adminAuth'

type AdminGuardProps = {
  children: ReactNode
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const isAuthed = useAdminAuthStore((state) => state.isAuthed)
  const location = useLocation()

  if (!isAuthed) {
    return <Navigate to='/admin/login' replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}

// src/components/admin/pages/AdminApp.tsx
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAdminAuth } from '../store/auth'
import Shell from '../layout/Shell'
import Login from './Login'

// Halaman konten admin (gunakan yang kamu punya)
import Dashboard from './Dashboard'
import Orders from './Orders'
import Products from './Products'
import Reviews from './Reviews'
import Campaigns from './Campaigns'
import Customers from './Customers'
import Reports from './Reports'
import Settings from './Settings'

function RequireAuth({ children }: { children: React.ReactElement }) {
  const { session } = useAdminAuth()
  if (!session) return <Navigate to="/admin/login" replace />
  return children
}

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <Shell />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="products" element={<Products />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="customers" element={<Customers />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}

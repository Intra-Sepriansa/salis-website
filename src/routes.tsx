// src/Routes.tsx
import { Route, Routes } from 'react-router-dom'

// Layouts
import PublicLayout from './layouts/PublicLayout'
import MinimalLayout from './layouts/MinimalLayout'

// Public pages
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Payment from './pages/Payment'
import Gateway from './pages/Gateway'
import Success from './pages/Success'
import Profile from './pages/Profile'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import About from './pages/About'
import NotFound from './pages/NotFound'
import NoSignal404 from './pages/NoSignal404'
import SupportChat from './pages/SupportChat'

// SEO / Content
import Blog from './pages/Blog'
import Article from './pages/Article'
import CityLanding from './pages/CityLanding'

// Legal
import Privacy from './pages/legal/Privacy'
import Terms from './pages/legal/Terms'
import PreorderPolicy from './pages/legal/PreorderPolicy'

// ✅ Admin (versi baru, all-in-one: login + shell + pages)
import AdminApp from './components/admin/pages/AdminApp'

export default function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC LAYOUT */}
      <Route element={<PublicLayout />}>
        <Route path='/' element={<Home />} />
        <Route path='/catalog' element={<Catalog />} />
        <Route path='/product/:slug' element={<ProductDetail />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/checkout' element={<Checkout />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/orders/:id' element={<OrderDetail />} />
        <Route path='/about' element={<About />} />
        <Route path='/support' element={<SupportChat />} />

        {/* SEO & CONTENT */}
        <Route path='/blog' element={<Blog />} />
        <Route path='/blog/:slug' element={<Article />} />
        <Route path='/kota/:city' element={<CityLanding />} />

        {/* LEGAL */}
        <Route path='/privacy' element={<Privacy />} />
        <Route path='/terms' element={<Terms />} />
        <Route path='/preorder-policy' element={<PreorderPolicy />} />
      </Route>

      {/* MINIMAL LAYOUT (gateway/success/offline) */}
      <Route element={<MinimalLayout />}>
        <Route path='/payment' element={<Payment />} />
        <Route path='/gateway' element={<Gateway />} />
        <Route path='/success' element={<Success />} />
        <Route path='/offline' element={<NoSignal404 />} />
      </Route>

      {/* ✅ ADMIN APP (semua rute admin di-handle di dalam AdminApp) */}
      <Route path='/admin/*' element={<AdminApp />} />

      {/* 404 */}
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}

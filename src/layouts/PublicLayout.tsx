import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MobileNav from '../components/MobileNav'
import ToastStack from '../components/ui/ToastStack'
import BackToTopFab from '../components/BackToTopFab'
import AbandonedCartBanner from '../components/cart/AbandonedCartBanner'
import InstallPWAHint from '../components/InstallPWAHint'
import CartSync from '../components/cart/CartSync'
import AiAssistantWidget from '../components/AiAssistantWidget'
import { FLAGS } from '../lib/flags'
import { useReferralCapture } from '../hooks/useReferralCapture'

export default function PublicLayout() {
  useReferralCapture()
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--fg)]">
      <Navbar />
      <main className="flex-1 pt-24 md:pt-28 lg:pt-32">
        <div className="container-p space-y-10 pb-8">
          {FLAGS.enableAbandonedCartBanner && <AbandonedCartBanner />}
          {FLAGS.enablePWAInstallHint && <InstallPWAHint />}
          <CartSync />
          <Outlet />
        </div>
      </main>
      <Footer />
      <BackToTopFab />
      <MobileNav />
      <ToastStack />
      <AiAssistantWidget />
    </div>
  )
}

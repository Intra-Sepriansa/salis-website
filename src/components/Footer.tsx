import { Facebook, Instagram, Mail, Phone, Youtube } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const socials = [
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com/salis' },
  { icon: Facebook, label: 'Facebook', href: 'https://facebook.com/salis' },
  { icon: Youtube, label: 'YouTube', href: 'https://youtube.com/salis' },
]

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'Catalog', to: '/catalog' },
  { label: 'Orders', to: '/orders' },
  { label: 'About', to: '/about' },
]

export function Footer() {
  const fadeUp = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  }

  return (
    <footer className='mt-10 bg-transparent pb-12 text-sm'>
      <div className='container-p space-y-12'>
        <motion.div
          {...fadeUp}
          className='grid gap-10 rounded-3xl border border-[var(--border)] bg-white/90 p-8 shadow-[var(--shadow-soft)] backdrop-blur md:grid-cols-[2fr_1fr_1fr] md:p-12'
        >
          <div className='space-y-5'>
            <div className='flex items-center gap-3'>
              <img src='/assets/logo-salis.png' className='h-14 w-14 rounded-2xl object-cover' alt='Logo Salis' />
              <div>
                <p className='text-xs uppercase tracking-[0.35em] text-[var(--muted-foreground)]'>Salis Shop</p>
                <span className='text-xl font-semibold text-[var(--fg)]'>Pastry & Frozen Delight</span>
              </div>
            </div>
            <p className='max-w-md text-[var(--muted-foreground)]'>
              Toko pastry dan snack rumahan dengan bahan berkualitas serta sentuhan rasa khas Salis. Kami melayani kebutuhan hampers, catering, hingga stok frozen untuk rumah dan bisnis rekananmu.
            </p>
            <div className='flex flex-wrap gap-4 text-[var(--muted-foreground)]'>
              <span className='flex items-center gap-2'><Phone className='h-4 w-4' aria-hidden /> +62 85817254544</span>
              <span className='flex items-center gap-2'><Mail className='h-4 w-4' aria-hidden /> salsanabila2018@gmail.com</span>
            </div>
            <p className='text-xs text-[var(--muted-foreground)]'>Jam operasional: Senin - Minggu Sistem Pre-order</p>
          </div>
          <div>
            <h4 className='mb-4 text-base font-semibold text-[var(--fg)]'>Navigasi</h4>
            <ul className='space-y-2 text-[var(--muted-foreground)]'>
              {quickLinks.map(({ label, to }) => (
                <li key={to}>
                  <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 360, damping: 26 }}>
                    <Link to={to} className='transition hover:text-[var(--primary)]'>
                      {label}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className='mb-4 text-base font-semibold text-[var(--fg)]'>Ikuti kami</h4>
            <div className='flex gap-3'>
              {socials.map(({ icon: Icon, label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  target='_blank'
                  rel='noreferrer'
                  aria-label={label}
                  whileHover={{ y: -3, scale: 1.06 }}
                  whileTap={{ scale: 0.96 }}
                  className='inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-white/90 text-[var(--muted-foreground)] shadow-soft transition hover:border-[var(--primary)] hover:text-[var(--primary)]'
                >
                  <Icon className='h-5 w-5' aria-hidden />
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.3, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className='flex flex-col items-center justify-between gap-3 text-xs text-[var(--muted-foreground)] md:flex-row'
        >
          <span>(c) {new Date().getFullYear()} Salis Shop. All rights reserved.</span>
          <span>Made with love in Tangerang.</span>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer

import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './no-signal.css'

export default function NoSignal404() {
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const add = () => {
      const star = document.createElement('div')
      star.classList.add('nosignal-star')
      const top = Math.random() * window.innerHeight
      let right = Math.random() * 500
      star.style.top = `${top}px`
      wrap.appendChild(star)
      const mover = window.setInterval(() => {
        if (right >= window.innerWidth) { window.clearInterval(mover); star.remove(); return }
        right += 3; star.style.right = `${right}px`
      }, 10)
    }
    const t = window.setInterval(add, 100)
    return () => { window.clearInterval(t); wrap.querySelectorAll('.nosignal-star').forEach(el => el.remove()) }
  }, [])

  const btn = 'inline-flex items-center rounded-xl px-4 py-2 bg-white text-black hover:opacity-90 shadow-soft'

  return (
    <div className="nosignal-wrap" ref={wrapRef} role="main" aria-label="Tidak ada koneksi atau halaman tidak ditemukan">
      <div className="nosignal-text">
        <div style={{ letterSpacing: 6, opacity: .9 }}>ERROR</div>
        <h1>404</h1>
        <hr />
        <div>Halaman Tidak Ditemukan</div>
        <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/" className={btn}>Kembali</Link>
          <button onClick={() => window.location.reload()} className={btn}>Muat ulang</button>
        </div>
      </div>
      <img
        className="nosignal-astro"
        src="/assets/astronaut.png"
        onError={(e) => { (e.currentTarget as HTMLImageElement).src =
          'https://images.vexels.com/media/users/3/152639/isolated/preview/506b575739e90613428cdb399175e2c8-space-astronaut-cartoon-by-vexels.png' }}
        alt="Astronaut floating in space"
      />
    </div>
  )
}

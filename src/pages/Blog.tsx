import { Link } from 'react-router-dom'
import MetaHead from '../components/MetaHead'

const POSTS = [
  { slug: 'tips-kue-ultah-lembut', title: 'Tips Kue Ulang Tahun Tetap Lembut', excerpt: 'Cara simpan & sajikan kue agar lembut…' },
  { slug: 'resep-cookies-butter', title: 'Resep Cookies Butter Favorit', excerpt: 'Resep sederhana cookies butter ala Salis…' },
]

export default function Blog() {
  return (
    <section className="space-y-8">
      <MetaHead title="Blog & Resep" description="Artikel, resep, dan panduan baking dari Salis." />
      <header>
        <h1 className="text-3xl font-semibold text-[var(--fg)]">Blog & Resep</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Bacaan singkat seputar kue & bakery.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {POSTS.map(p => (
          <Link key={p.slug} to={`/blog/${p.slug}`} className="card p-6 hover:-translate-y-0.5 transition">
            <h2 className="text-xl font-semibold text-[var(--fg)]">{p.title}</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{p.excerpt}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

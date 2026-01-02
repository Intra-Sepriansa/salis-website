import { useParams } from 'react-router-dom'
import MetaHead from '../components/MetaHead'

export default function Article() {
  const { slug } = useParams()
  const title = (slug ?? '').split('-').map(s => s[0]?.toUpperCase() + s.slice(1)).join(' ')
  return (
    <article className="prose max-w-none dark:prose-invert">
      <MetaHead title={title} description="Artikel dari Salis." />
      <h1>{title}</h1>
      <p>Konten artikel bisa kamu isi di sini. Tambahkan gambar, langkah, atau tips.</p>
    </article>
  )
}

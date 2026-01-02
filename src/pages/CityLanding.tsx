import { useParams } from 'react-router-dom'
import MetaHead from '../components/MetaHead'

export default function CityLanding() {
  const { city } = useParams()
  const title = `Kue Ulang Tahun ${city?.toUpperCase() ?? ''} · Salis`
  return (
    <section className="space-y-6">
      <MetaHead title={title} description={`Pesan kue ulang tahun area ${city}. Antar cepat, rasa juara.`} />
      <h1 className="text-3xl font-semibold text-[var(--fg)]">Kue Ulang Tahun di {city}</h1>
      <p className="text-sm text-[var(--muted-foreground)]">
        Salis melayani pengantaran {city}. Pilih kue favorit & jadwalkan kirim hari ini.
      </p>
    </section>
  )
}

export default function About() {
  return (
    <section className="card space-y-8 p-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-[var(--fg)]">Tentang Salis Shop</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Cerita di balik dapur kecil yang ingin membuat hari kamu lebih manis.
        </p>
      </div>
      <div className="grid gap-6 text-sm text-[var(--muted-foreground)] lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-[var(--fg)]">Awal berdiri</h2>
          <p>
            Salis Shop berawal dari dapur rumahan tahun 2017 yang fokus pada pastry handmade. Kami menggunakan bahan
            premium dan resep keluarga yang terus dikembangkan agar cocok untuk lidah lokal.
          </p>
          <p>
            Kini Salis melayani pemesanan harian, katering acara kantor, hampers, hingga stok frozen untuk usaha rekanan.
          </p>
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-[var(--fg)]">Nilai kami</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Kualitas rasa dan konsistensi produksi.</li>
            <li>Pelayanan ramah dan cepat merespon.</li>
            <li>Berinovasi dengan menu baru tanpa meninggalkan klasik favorit.</li>
          </ul>
        </div>
      </div>
      <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-white/70 p-6">
        <h2 className="text-lg font-semibold text-[var(--fg)]">Hubungi kami</h2>
        <p>Email: hello@salis.id</p>
        <p>WhatsApp: 0812-0000-0000</p>
        <p>Alamat produksi: Bekasi, Jawa Barat</p>
      </div>
    </section>
  )
}

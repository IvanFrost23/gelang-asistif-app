import Screen from '../components/Screen'

export default function History() {
  return (
    <Screen title="Riwayat" subtitle="Suara yang terdeteksi hari ini">
      <section className="card">
        <h2>Belum ada riwayat</h2>
        <p>Setiap suara yang dikenali akan dicatat di sini beserta waktu dan jenisnya.</p>
      </section>
    </Screen>
  )
}

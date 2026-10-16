import Screen from '../components/Screen'

const kinds = [
  { name: 'Nama dipanggil', color: 'var(--blue)', sub: 'Biru · 2 getaran pendek' },
  { name: 'Alarm / bahaya', color: 'var(--red)', sub: 'Merah · getar panjang berulang · selalu aktif' },
  { name: 'Bel sekolah', color: 'var(--yellow)', sub: 'Kuning · 1 getaran sedang' },
  { name: 'Bel pintu / ketukan', color: 'var(--green)', sub: 'Hijau · 3 getaran pendek' },
]

export default function Settings() {
  return (
    <Screen title="Pengaturan" subtitle="Jenis suara yang dideteksi">
      <div className="list">
        {kinds.map((k) => (
          <div key={k.name} className="row">
            <span className="dot" style={{ background: k.color }} />
            <span className="grow">
              <div className="title">{k.name}</div>
              <div className="sub">{k.sub}</div>
            </span>
          </div>
        ))}
      </div>
      <p className="stub">Saklar dan kepekaan ditambahkan pada langkah 3.</p>
    </Screen>
  )
}

import Screen from '../components/Screen'
import MenuRow from '../components/MenuRow'
import { routes } from '../app/routes'

export default function Home() {
  return (
    <Screen title="Beranda" subtitle="Gelang Asistif Getar dan Cahaya">
      <section className="card">
        <h2>Aisyah <span className="pill">Gelang terhubung</span></h2>
        <p>Status gelang dan tombol panggil akan muncul di sini (langkah 3).</p>
      </section>
      <button className="btn block">Panggil anak sekarang</button>
      <div className="list">
        <MenuRow to={routes.profile} title="Profil anak" sub="Nama panggilan dan gelang" />
        <MenuRow to={routes.connect} title="Sambungkan gelang" sub="Bluetooth" />
        <MenuRow to={routes.training} title="Mode latihan" sub="Coba setiap getaran dan warna" />
        <MenuRow to={routes.guidebook} title="Buku panduan" sub="Untuk pendamping dan anak" />
      </div>
    </Screen>
  )
}

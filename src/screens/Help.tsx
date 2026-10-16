import Screen from '../components/Screen'
import MenuRow from '../components/MenuRow'
import { routes } from '../app/routes'

export default function Help() {
  return (
    <Screen title="Bantuan">
      <div className="list">
        <MenuRow to={routes.guidebook} title="Buku panduan" sub="Cara memasang, mengatur, dan arti tiap kode" />
        <MenuRow to={routes.training} title="Mode latihan" sub="Latih anak mengenali kode" />
      </div>
      <section className="card">
        <h2>Tentang</h2>
        <p>Tugas Teknologi Asistif, S1 Pendidikan Khusus, Universitas Negeri Surabaya, 2026.</p>
      </section>
    </Screen>
  )
}

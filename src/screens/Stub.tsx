import { Link } from 'react-router-dom'
import Screen from '../components/Screen'
import { routes } from '../app/routes'

export default function Stub({ title, step }: { title: string; step: number }) {
  return (
    <Screen title={title}>
      <p className="stub">Layar ini dibuat pada langkah {step}.</p>
      <Link to={routes.home} className="btn ghost block">Kembali ke Beranda</Link>
    </Screen>
  )
}

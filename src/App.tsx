import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { routes } from './app/routes'
import Home from './screens/Home'
import Settings from './screens/Settings'
import History from './screens/History'
import Help from './screens/Help'
import Stub from './screens/Stub'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={routes.home} element={<Home />} />
        <Route path={routes.settings} element={<Settings />} />
        <Route path={routes.history} element={<History />} />
        <Route path={routes.help} element={<Help />} />
        <Route path={routes.login} element={<Stub title="Masuk" step={3} />} />
        <Route path={routes.profile} element={<Stub title="Profil anak" step={3} />} />
        <Route path={routes.connect} element={<Stub title="Sambungkan gelang" step={3} />} />
        <Route path={routes.training} element={<Stub title="Mode latihan" step={3} />} />
        <Route path={routes.guidebook} element={<Stub title="Buku panduan" step={6} />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { routes } from './app/routes'
import { LangProvider } from './i18n'
import Home from './screens/Home'
import Settings from './screens/Settings'
import History from './screens/History'
import Help from './screens/Help'
import Stub from './screens/Stub'
import Training from './screens/Training'
import Login from './screens/Login'
import Profile from './screens/Profile'
import Connect from './screens/Connect'

export default function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <Routes>
          <Route path={routes.home} element={<Home />} />
          <Route path={routes.settings} element={<Settings />} />
          <Route path={routes.history} element={<History />} />
          <Route path={routes.help} element={<Help />} />
          <Route path={routes.login} element={<Login />} />
          <Route path={routes.profile} element={<Profile />} />
          <Route path={routes.connect} element={<Connect />} />
          <Route path={routes.training} element={<Training />} />
          <Route path={routes.guidebook} element={<Stub screen="guidebook" step={6} />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </LangProvider>
  )
}

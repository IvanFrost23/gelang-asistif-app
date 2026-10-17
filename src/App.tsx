import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { routes } from './app/routes'
import { LangProvider } from './i18n'
import Home from './screens/Home'
import Settings from './screens/Settings'
import History from './screens/History'
import Help from './screens/Help'
import Training from './screens/Training'
import Login from './screens/Login'
import Profile from './screens/Profile'
import Connect from './screens/Connect'
import Guidebook from './screens/Guidebook'
import Quiz from './screens/Quiz'
import Flash from './components/Flash'

export default function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <Flash />
        <Routes>
          <Route path={routes.home} element={<Home />} />
          <Route path={routes.settings} element={<Settings />} />
          <Route path={routes.history} element={<History />} />
          <Route path={routes.help} element={<Help />} />
          <Route path={routes.login} element={<Login />} />
          <Route path={routes.profile} element={<Profile />} />
          <Route path={routes.connect} element={<Connect />} />
          <Route path={routes.training} element={<Training />} />
          <Route path={routes.quiz} element={<Quiz />} />
          <Route path={routes.guidebook} element={<Guidebook />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </LangProvider>
  )
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { startSync } from './sync'
import { initTheme } from './theme'

initTheme()
startSync()

if (import.meta.env.DEV) {
  import('./listen/yamnet').then((m) => { (window as unknown as { __gelang: unknown }).__gelang = m })
  import('./listen/custom').then((m) => { (window as unknown as { __cos: unknown }).__cos = m.cosine })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

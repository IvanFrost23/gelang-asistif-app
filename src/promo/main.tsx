import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LangProvider } from './i18n'
import App from './App'
import { initNoZoom } from '../noZoom'
import './promo.css'

// Страница не масштабируется; зум работает только у 3D-модели (Explorer)
initNoZoom()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <App />
    </LangProvider>
  </StrictMode>,
)

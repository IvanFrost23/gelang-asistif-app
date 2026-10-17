/**
 * Firebase подключается только если заполнен .env.local. Без него приложение работает полностью локально.
 * Если провайдер email ещё не включён в консоли, вход тоже откатывается в локальный режим.
 */
import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const cfg = {
  apiKey: import.meta.env.VITE_FB_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FB_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FB_APP_ID as string | undefined,
}

export const firebaseEnabled = !!(cfg.apiKey && cfg.projectId && cfg.appId)

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

if (firebaseEnabled) {
  app = initializeApp(cfg)
  auth = getAuth(app)
  db = getFirestore(app)
}

export { auth, db }

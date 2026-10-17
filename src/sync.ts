/** Синхронизация профилей и настроек с Firestore для вошедшего пользователя. Локальное состояние первично. */
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth, db } from './firebase'
import { useStore } from './store'

let unsub: (() => void) | null = null
let timer = 0

function pushState(uid: string) {
  if (!db) return
  const { profiles, activeProfileId, settings } = useStore.getState()
  setDoc(doc(db, 'users', uid), { profiles, activeProfileId, settings, updatedAt: Date.now() }, { merge: true }).catch((e) => console.warn('sync push failed', e))
}

async function pullState(uid: string) {
  if (!db) return
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    if (!snap.exists()) return
    const data = snap.data() as { profiles?: unknown; activeProfileId?: unknown; settings?: unknown }
    const s = useStore.getState()
    // Облако заполняет только пустое локальное состояние, чтобы не затирать то, что сделано офлайн.
    if (s.profiles.length === 0 && Array.isArray(data.profiles)) {
      useStore.setState({ profiles: data.profiles as typeof s.profiles, activeProfileId: (data.activeProfileId as string | null) ?? null })
    }
    if (data.settings && typeof data.settings === 'object') useStore.setState({ settings: { ...s.settings, ...(data.settings as object) } })
  } catch (e) { console.warn('sync pull failed', e) }
}

function watch(uid: string) {
  unsub?.()
  unsub = useStore.subscribe((s, prev) => {
    if (s.profiles === prev.profiles && s.activeProfileId === prev.activeProfileId && s.settings === prev.settings) return
    clearTimeout(timer)
    timer = window.setTimeout(() => pushState(uid), 800)
  })
}

/** Вызывается один раз при старте приложения. */
export function startSync() {
  if (!auth) return
  onAuthStateChanged(auth, (u: User | null) => {
    unsub?.(); unsub = null
    if (!u) return
    useStore.getState().signIn(u.email ?? '', u.uid)
    pullState(u.uid).then(() => { pushState(u.uid); watch(u.uid) })
  })
}

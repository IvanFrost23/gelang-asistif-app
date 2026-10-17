import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CATEGORIES, type Category } from '../domain/signals'

export type Sensitivity = 'low' | 'medium' | 'high'
export type BraceletStatus = 'disconnected' | 'searching' | 'connected'
export type EventSource = 'manual' | 'training' | 'simulator' | 'speech' | 'yamnet'

export interface ChildProfile {
  id: string
  name: string
  callNames: string[]
  braceletId: string | null
}

export interface SoundSettings {
  enabled: Record<Category, boolean>
  sensitivity: Sensitivity
}

export interface HistoryEvent {
  id: string
  at: number
  category: Category
  source: EventSource
  profileId: string
  confidence?: number
  detail?: string
}

interface State {
  user: { email: string; uid?: string; mode: 'cloud' | 'local' } | null
  profiles: ChildProfile[]
  activeProfileId: string | null
  settings: SoundSettings
  bracelet: BraceletStatus
  history: HistoryEvent[]
  quizResults: { at: number; score: number }[]
  quizBest: number

  signIn: (email: string, uid?: string) => void
  signOut: () => void
  addProfile: (p: Omit<ChildProfile, 'id'>) => string
  updateProfile: (id: string, patch: Partial<Omit<ChildProfile, 'id'>>) => void
  removeProfile: (id: string) => void
  setActiveProfile: (id: string) => void
  setEnabled: (c: Category, on: boolean) => void
  setSensitivity: (s: Sensitivity) => void
  setBracelet: (s: BraceletStatus) => void
  addEvent: (e: Omit<HistoryEvent, 'id' | 'at' | 'profileId'>) => void
  clearHistory: () => void
  addQuizResult: (score: number) => void
}

const uid = () => Math.random().toString(36).slice(2, 10)

const defaultSettings: SoundSettings = {
  enabled: Object.fromEntries(CATEGORIES.map((c) => [c, true])) as Record<Category, boolean>,
  sensitivity: 'medium',
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      user: null,
      profiles: [],
      activeProfileId: null,
      settings: defaultSettings,
      bracelet: 'disconnected',
      history: [],
      quizResults: [],
      quizBest: 0,

      signIn: (email, uid) => set({ user: { email, uid, mode: uid ? 'cloud' : 'local' } }),
      signOut: () => set({ user: null, bracelet: 'disconnected' }),
      addProfile: (p) => {
        const id = uid()
        set((s) => ({ profiles: [...s.profiles, { ...p, id }], activeProfileId: s.activeProfileId ?? id }))
        return id
      },
      updateProfile: (id, patch) => set((s) => ({ profiles: s.profiles.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      removeProfile: (id) =>
        set((s) => {
          const profiles = s.profiles.filter((p) => p.id !== id)
          return { profiles, activeProfileId: s.activeProfileId === id ? profiles[0]?.id ?? null : s.activeProfileId }
        }),
      setActiveProfile: (id) => set({ activeProfileId: id }),
      setEnabled: (c, on) => set((s) => ({ settings: { ...s.settings, enabled: { ...s.settings.enabled, [c]: c === 'danger' ? true : on } } })),
      setSensitivity: (sensitivity) => set((s) => ({ settings: { ...s.settings, sensitivity } })),
      setBracelet: (bracelet) => set({ bracelet }),
      addEvent: (e) => {
        const profileId = get().activeProfileId ?? ''
        set((s) => ({ history: [{ ...e, id: uid(), at: Date.now(), profileId }, ...s.history].slice(0, 200) }))
      },
      clearHistory: () => set({ history: [] }),
      addQuizResult: (score) => set((s) => ({ quizResults: [{ at: Date.now(), score }, ...s.quizResults].slice(0, 50), quizBest: Math.max(s.quizBest, score) })),
    }),
    { name: 'gelang-asistif', version: 2, migrate: (st) => ({ quizResults: [], quizBest: 0, ...(st as object) }) },
  ),
)

export const useActiveProfile = () => useStore((s) => s.profiles.find((p) => p.id === s.activeProfileId) ?? null)

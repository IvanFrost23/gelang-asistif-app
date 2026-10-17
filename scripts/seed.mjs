// Общий helper для скриншот-скриптов: засевает вход, профиль и подключённый браслет.
export const SEED = JSON.stringify({ state: {
  user: { email: 'guru@sekolah.id' },
  profiles: [{ id: 'p1', name: 'Nadiyya', callNames: ['Nadiyya', 'Nad', 'Diyya'], braceletId: 'GA-2041' }],
  activeProfileId: 'p1',
  settings: { enabled: { name: true, danger: true, bell: true, home: true }, sensitivity: 'medium' },
  bracelet: 'connected', history: [] }, version: 1 })
export async function seed(p, url = 'http://localhost:5173/') {
  await p.goto(url, { waitUntil: 'networkidle0' })
  await p.evaluate((s) => localStorage.setItem('gelang-asistif', s), SEED)
  await p.reload({ waitUntil: 'networkidle0' })
}

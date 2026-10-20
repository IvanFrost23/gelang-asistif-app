/** Тексты промо-страницы на индонезийском и английском. Язык общий с приложением (тот же ключ localStorage). */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Category } from '../domain/signals'
import type { PartId, InnerId } from './three/bracelet'

export type Lang = 'id' | 'en'

const id = {
  meta: {
    title: 'Gelang Asistif · Suara penting, terasa di pergelangan',
    description: 'Gelang getar dan cahaya untuk anak tunarungu. Nama dipanggil, bel sekolah, bel pintu, dan tanda bahaya berubah menjadi getaran dan warna.',
  },
  nav: { codes: 'Kode', inside: 'Di dalam', explore: '3D', how: 'Cara kerja', app: 'Aplikasi', open: 'Buka aplikasi' },
  hero: {
    eyebrow: 'Gelang Asistif Getar dan Cahaya',
    title: ['Suara penting.', 'Terasa di pergelangan.'],
    lead: 'Gelang untuk anak tunarungu usia 7–12 tahun. Saat namanya dipanggil, bel sekolah berbunyi, ada tamu, atau ada tanda bahaya, gelang bergetar dan menyala dengan warnanya sendiri.',
    explore: 'Jelajahi dalam 3D',
    tryApp: 'Coba aplikasinya',
    scroll: 'Gulir',
  },
  statement:
    'Anak tunarungu tidak mendengar namanya dipanggil dari belakang, bel masuk kelas, atau klakson di jalan. Mereka harus ditepuk atau didatangi. Gelang ini mengubah bunyi penting menjadi sentuhan dan cahaya, supaya anak tahu sendiri.',
  codes: {
    kicker: 'Empat kode',
    title: 'Satu gelang. Empat arti.',
    lead: 'Setiap kode bisa dikenali dari getarannya saja, bahkan di bawah terik matahari atau oleh anak dengan buta warna.',
    of: 'Kode',
    colorLabel: 'Warna lampu',
    patternLabel: 'Pola getar',
    childDoes: 'Yang dilakukan anak',
    feel: 'Rasakan',
    replay: 'Putar lagi',
    alwaysOn: 'Selalu aktif. Kategori bahaya tidak bisa dimatikan.',
    items: {
      name: { sound: 'Nama dipanggil', color: 'Biru', pattern: '2 getaran pendek', child: 'Menoleh. Cari siapa yang memanggil.' },
      danger: { sound: 'Bahaya', sub: 'Alarm, sirine, klakson', color: 'Merah, berkedip cepat', pattern: 'Getar panjang berulang', child: 'Berhenti. Lihat sekitar. Dekati orang dewasa.' },
      bell: { sound: 'Bel sekolah', sub: 'Penanda waktu', color: 'Kuning', pattern: '1 getaran sedang', child: 'Ikuti kegiatan berikutnya.' },
      home: { sound: 'Ada tamu', sub: 'Bel pintu, ketukan', color: 'Hijau', pattern: '3 getaran pendek', child: 'Beri tahu orang tua.' },
    } as Record<Category, { sound: string; sub?: string; color: string; pattern: string; child: string }>,
  },
  inside: {
    kicker: 'Di dalam',
    title: 'Kecil di luar. Lengkap di dalam.',
    lead: 'Satu mikrokontroler, satu motor, satu lampu, satu tombol. Setiap komponen dipilih supaya gelang tetap ringan dan nyaman dipakai seharian.',
    labels: {
      glass: 'Kaca dengan jendela lampu',
      led: 'LED RGB',
      button: 'Tombol',
      esp32: 'ESP32 + Bluetooth',
      battery: 'Baterai isi ulang',
      motor: 'Motor getar koin',
      port: 'Kontak pengisian',
    } as Record<InnerId, string>,
  },
  explore: {
    kicker: 'Model 3D',
    title: 'Putar. Perbesar. Lihat lebih dekat.',
    hintMouse: 'Seret untuk memutar, gulir untuk memperbesar. Klik titik atau bagian gelang.',
    hintTouch: 'Geser untuk memutar, cubit untuk memperbesar. Ketuk titik atau bagian gelang.',
    tapToStart: 'Ketuk untuk menjelajah',
    done: 'Selesai',
    inside: 'Lihat dalam',
    assemble: 'Rakit',
    reset: 'Atur ulang',
    zoomIn: 'Perbesar',
    zoomOut: 'Perkecil',
    play: 'Mainkan kode',
    parts: 'Bagian',
    close: 'Tutup',
    planned: 'Rencana',
    next: 'Berikutnya',
    prev: 'Sebelumnya',
  },
  parts: {
    led: { name: 'LED RGB', text: 'Satu lampu untuk semua warna: biru, merah, kuning, hijau. Cahaya keluar lewat jendela di kaca, jadi terlihat dari berbagai sudut.' },
    button: { name: 'Tombol', text: 'Satu tombol saja: menyalakan gelang dan menghentikan getaran. Mudah ditemukan dan ditekan anak.' },
    mic: { name: 'Mikrofon', text: 'Rencana pengembangan: mikrofon di dalam gelang, supaya gelang mengenali suara sendiri tanpa ponsel di dekat anak.', planned: true },
    esp32: { name: 'ESP32 + Bluetooth', text: 'Mikrokontroler menerima kode dari aplikasi lewat Bluetooth, lalu mengatur getar dan lampu. Kecil dan hemat daya.' },
    battery: { name: 'Baterai isi ulang', text: 'Tertutup rapat di dalam korpus dan diisi lewat port pengisian.' },
    motor: { name: 'Motor getar koin', text: 'Menghasilkan pola getar. Cukup terasa tetapi tidak mengagetkan, dan kekuatannya dapat diatur.' },
    port: { name: 'Port pengisian', text: 'Kontak pengisian di sisi bawah korpus. Tanpa lubang terbuka, jadi korpus tetap tertutup rapat.' },
    strap: { name: 'Tali silikon', text: 'Lembut, ringan, dan tahan percikan air. Nyaman dipakai seharian di sekolah dan di rumah.' },
    buckle: { name: 'Gesper', text: 'Ukuran dapat disesuaikan dengan pergelangan anak. Lubang di tali memberi beberapa pilihan panjang.' },
  } as Record<PartId, { name: string; text: string; planned?: boolean }>,
  how: {
    kicker: 'Cara kerja',
    title: 'Ponsel mendengar. Gelang memberi tahu.',
    steps: [
      { h: 'Mendengar', p: 'Aplikasi di ponsel pendamping mendengarkan sekitar lewat mikrofon.' },
      { h: 'Mengenali', p: 'Model YAMNet mengenali bel, sirine, klakson, dan ketukan langsung di ponsel. Nama anak dikenali lewat pengenalan suara.' },
      { h: 'Memberi tahu', p: 'Kode dikirim lewat Bluetooth. Gelang bergetar dan menyala dengan warna kodenya.' },
    ],
    privacy: 'Suara diproses di perangkat. Tidak ada rekaman yang disimpan.',
  },
  app: {
    kicker: 'Aplikasi pendamping',
    title: 'Untuk orang tua dan guru.',
    lead: 'Bahasa Indonesia, tombol besar, petunjuk bergambar. Satu akun untuk beberapa anak dan gelang.',
    features: [
      { h: 'Profil anak', p: 'Beberapa nama panggilan: nama lengkap, panggilan di sekolah, di rumah.' },
      { h: 'Pengaturan suara', p: 'Pilih jenis suara dan atur kepekaan. Bahaya selalu aktif.' },
      { h: 'Mode latihan', p: 'Tekan kode, rasakan getaran, lihat warna. Plus permainan Tebak kode.' },
      { h: 'Panggil manual', p: 'Panggil anak langsung dari aplikasi bila pengenalan suara gagal.' },
      { h: 'Riwayat', p: 'Setiap suara yang dikenali tercatat dengan waktu dan jenisnya.' },
      { h: 'Buku panduan', p: 'Untuk pendamping dan untuk anak, dengan gambar setiap kode.' },
    ],
    shots: ['Beranda', 'Mode latihan', 'Panduan anak', 'Pengaturan'],
  },
  specs: {
    kicker: 'Spesifikasi',
    title: 'Sederhana dengan sengaja.',
    items: [
      { k: 'Mikrokontroler', v: 'ESP32', s: 'dengan Bluetooth' },
      { k: 'Getaran', v: 'Motor koin', s: '4 pola, kekuatan dapat diatur' },
      { k: 'Cahaya', v: '1 LED RGB', s: 'biru, merah, kuning, hijau' },
      { k: 'Daya', v: 'Baterai isi ulang', s: 'tertutup rapat, port pengisian' },
      { k: 'Kontrol', v: '1 tombol', s: 'nyalakan dan hentikan getaran' },
      { k: 'Tali', v: 'Silikon', s: 'tahan percikan air, ukuran dapat disesuaikan' },
      { k: 'Pengguna', v: '7–12 tahun', s: 'anak tunarungu, SLB-B dan sekolah inklusi' },
      { k: 'Aplikasi', v: 'Android dan web', s: 'Bahasa Indonesia dan English' },
    ],
    status: 'Status prototipe',
    statusText: 'Gelang masih dalam tahap desain. Aplikasi sudah berjalan dan mensimulasikan sambungan Bluetooth: ponsel berperan sebagai gelang, dengan getaran dan warna di layar.',
  },
  cta: {
    title: 'Coba sekarang.',
    lead: 'Buka versi web di Chrome pada Android untuk fitur lengkap, atau pasang aplikasinya.',
    web: 'Buka aplikasi web',
    apk: 'Unduh APK',
    apkSub: 'Android 7+',
    code: 'Kode sumber',
  },
  team: {
    kicker: 'Tim',
    title: 'Dibuat oleh mahasiswa UNESA.',
    course: 'Tugas mata kuliah Teknologi Asistif, S1 Pendidikan Khusus, Fakultas Ilmu Pendidikan, Universitas Negeri Surabaya, 2026.',
    lecturer: 'Dosen pengampu',
  },
  footer: 'Prototipe untuk tugas kuliah. Bukan perangkat medis.',
  fallback: 'Model 3D membutuhkan WebGL. Buka halaman ini di browser yang lebih baru.',
}

type Dict = typeof id

const en: Dict = {
  meta: {
    title: 'Gelang Asistif · Important sounds, felt on the wrist',
    description: 'A vibration and light bracelet for deaf children. Their name, the school bell, the doorbell and danger signals become vibration and colour.',
  },
  nav: { codes: 'Codes', inside: 'Inside', explore: '3D', how: 'How it works', app: 'App', open: 'Open the app' },
  hero: {
    eyebrow: 'Vibration and Light Assistive Bracelet',
    title: ['Important sounds.', 'Felt on the wrist.'],
    lead: 'A bracelet for deaf children aged 7–12. When their name is called, the school bell rings, someone is at the door or there is danger, it vibrates and lights up in its own colour.',
    explore: 'Explore in 3D',
    tryApp: 'Try the app',
    scroll: 'Scroll',
  },
  statement:
    'Deaf children do not hear their name called from behind, the class bell or a car horn. Someone has to tap them or walk over. This bracelet turns important sounds into touch and light, so the child knows on their own.',
  codes: {
    kicker: 'Four codes',
    title: 'One bracelet. Four meanings.',
    lead: 'Each code can be recognised by vibration alone, even in bright sunlight or by a colour-blind child.',
    of: 'Code',
    colorLabel: 'Light colour',
    patternLabel: 'Vibration',
    childDoes: 'What the child does',
    feel: 'Feel it',
    replay: 'Replay',
    alwaysOn: 'Always on. The danger category cannot be switched off.',
    items: {
      name: { sound: 'Name called', color: 'Blue', pattern: '2 short pulses', child: 'Turn around. Find who is calling.' },
      danger: { sound: 'Danger', sub: 'Alarm, siren, horn', color: 'Red, fast blinking', pattern: 'Long repeated pulses', child: 'Stop. Look around. Go to an adult.' },
      bell: { sound: 'School bell', sub: 'Time signal', color: 'Yellow', pattern: '1 medium pulse', child: 'Go to the next activity.' },
      home: { sound: 'Someone at the door', sub: 'Doorbell, knock', color: 'Green', pattern: '3 short pulses', child: 'Tell your parents.' },
    },
  },
  inside: {
    kicker: 'Inside',
    title: 'Small outside. Complete inside.',
    lead: 'One microcontroller, one motor, one light, one button. Every component is chosen to keep the bracelet light and comfortable to wear all day.',
    labels: {
      glass: 'Glass with a light window',
      led: 'RGB LED',
      button: 'Button',
      esp32: 'ESP32 + Bluetooth',
      battery: 'Rechargeable battery',
      motor: 'Coin vibration motor',
      port: 'Charging contacts',
    },
  },
  explore: {
    kicker: '3D model',
    title: 'Rotate. Zoom. Look closer.',
    hintMouse: 'Drag to rotate, scroll to zoom. Click a dot or a part of the bracelet.',
    hintTouch: 'Swipe to rotate, pinch to zoom. Tap a dot or a part of the bracelet.',
    tapToStart: 'Tap to explore',
    done: 'Done',
    inside: 'See inside',
    assemble: 'Assemble',
    reset: 'Reset',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    play: 'Play a code',
    parts: 'Parts',
    close: 'Close',
    planned: 'Planned',
    next: 'Next',
    prev: 'Previous',
  },
  parts: {
    led: { name: 'RGB LED', text: 'One light for every colour: blue, red, yellow, green. It shines through a window in the glass, so it is visible from many angles.' },
    button: { name: 'Button', text: 'Just one button: it switches the bracelet on and stops the vibration. Easy for a child to find and press.' },
    mic: { name: 'Microphone', text: 'Planned: a microphone inside the bracelet, so it can recognise sounds by itself without a phone near the child.', planned: true },
    esp32: { name: 'ESP32 + Bluetooth', text: 'The microcontroller receives codes from the app over Bluetooth and drives the vibration and light. Small and power-efficient.' },
    battery: { name: 'Rechargeable battery', text: 'Sealed inside the body and charged through the charging port.' },
    motor: { name: 'Coin vibration motor', text: 'Produces the vibration patterns. Strong enough to notice but not startling, and the strength is adjustable.' },
    port: { name: 'Charging port', text: 'Charging contacts on the underside of the body. No open holes, so the body stays sealed.' },
    strap: { name: 'Silicone strap', text: 'Soft, light and splash-resistant. Comfortable all day at school and at home.' },
    buckle: { name: 'Buckle', text: "Adjusts to the child's wrist. The holes in the strap give several lengths to choose from." },
  },
  how: {
    kicker: 'How it works',
    title: 'The phone listens. The bracelet tells.',
    steps: [
      { h: 'Listen', p: "The app on the carer's phone listens to the surroundings through the microphone." },
      { h: 'Recognise', p: "The YAMNet model recognises bells, sirens, horns and knocks right on the phone. The child's name is recognised by speech recognition." },
      { h: 'Notify', p: 'The code is sent over Bluetooth. The bracelet vibrates and lights up in the colour of the code.' },
    ],
    privacy: 'Sound is processed on the device. Nothing is recorded or stored.',
  },
  app: {
    kicker: 'Companion app',
    title: 'For parents and teachers.',
    lead: 'Indonesian language, large buttons, picture guides. One account for several children and bracelets.',
    features: [
      { h: 'Child profile', p: 'Several call names: full name, school nickname, home nickname.' },
      { h: 'Sound settings', p: 'Choose sound types and set the sensitivity. Danger is always on.' },
      { h: 'Training mode', p: 'Press a code, feel the vibration, see the colour. Plus the Guess the code game.' },
      { h: 'Manual call', p: 'Call the child straight from the app if sound recognition fails.' },
      { h: 'History', p: 'Every recognised sound is logged with its time and type.' },
      { h: 'Guidebook', p: 'For carers and for the child, with a picture of every code.' },
    ],
    shots: ['Home', 'Training mode', 'Child guide', 'Settings'],
  },
  specs: {
    kicker: 'Specifications',
    title: 'Simple on purpose.',
    items: [
      { k: 'Microcontroller', v: 'ESP32', s: 'with Bluetooth' },
      { k: 'Vibration', v: 'Coin motor', s: '4 patterns, adjustable strength' },
      { k: 'Light', v: '1 RGB LED', s: 'blue, red, yellow, green' },
      { k: 'Power', v: 'Rechargeable battery', s: 'sealed, charging port' },
      { k: 'Controls', v: '1 button', s: 'switch on and stop vibration' },
      { k: 'Strap', v: 'Silicone', s: 'splash-resistant, adjustable size' },
      { k: 'Users', v: 'Ages 7–12', s: 'deaf children, special and inclusive schools' },
      { k: 'App', v: 'Android and web', s: 'Indonesian and English' },
    ],
    status: 'Prototype status',
    statusText: 'The bracelet is at the design stage. The app already works and simulates the Bluetooth connection: the phone plays the bracelet, with vibration and colour on screen.',
  },
  cta: {
    title: 'Try it now.',
    lead: 'Open the web version in Chrome on Android for the full feature set, or install the app.',
    web: 'Open the web app',
    apk: 'Download APK',
    apkSub: 'Android 7+',
    code: 'Source code',
  },
  team: {
    kicker: 'Team',
    title: 'Made by UNESA students.',
    course: 'Assistive Technology course project, Bachelor of Special Education, Faculty of Education, Universitas Negeri Surabaya, 2026.',
    lecturer: 'Lecturer',
  },
  footer: 'A prototype for a university course. Not a medical device.',
  fallback: 'The 3D model needs WebGL. Open this page in a newer browser.',
}

export const dicts: Record<Lang, Dict> = { id, en }

const KEY = 'gelang-asistif:lang'
function initial(): Lang {
  const q = new URLSearchParams(location.search).get('lang')
  if (q === 'id' || q === 'en') return q
  try { const v = localStorage.getItem(KEY); if (v === 'id' || v === 'en') return v } catch { /* storage unavailable */ }
  return 'id'
}

const Ctx = createContext<{ lang: Lang; t: Dict; setLang: (l: Lang) => void }>({ lang: 'id', t: id, setLang: () => {} })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initial)
  useEffect(() => {
    const t = dicts[lang]
    document.documentElement.lang = lang
    document.title = t.meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description)
    try { localStorage.setItem(KEY, lang) } catch { /* ignore */ }
  }, [lang])
  return <Ctx.Provider value={{ lang, t: dicts[lang], setLang }}>{children}</Ctx.Provider>
}

export const useT = () => useContext(Ctx)

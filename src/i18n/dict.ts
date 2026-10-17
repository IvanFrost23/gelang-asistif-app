export type Lang = 'id' | 'en'

const id = {
  appName: 'Gelang Asistif Getar dan Cahaya',
  nav: { home: 'Beranda', settings: 'Pengaturan', history: 'Riwayat', help: 'Bantuan' },
  home: {
    connected: 'Gelang terhubung',
    statusStub: 'Status gelang dan tombol panggil akan muncul di sini (langkah 3).',
    call: 'Panggil anak sekarang',
    profile: 'Profil anak', profileSub: 'Nama panggilan dan gelang',
    connect: 'Sambungkan gelang', connectSub: 'Bluetooth',
    training: 'Mode latihan', trainingSub: 'Coba setiap getaran dan warna',
    guidebook: 'Buku panduan', guidebookSub: 'Untuk pendamping dan anak',
  },
  settings: {
    subtitle: 'Jenis suara yang dideteksi',
    stub: 'Saklar dan kepekaan ditambahkan pada langkah 3.',
    alwaysOn: 'selalu aktif',
  },
  signals: {
    name: 'Nama dipanggil', nameSub: 'Biru · 2 getaran pendek',
    danger: 'Alarm / bahaya', dangerSub: 'Merah · getar panjang berulang',
    bell: 'Bel sekolah', bellSub: 'Kuning · 1 getaran sedang',
    home: 'Bel pintu / ketukan', homeSub: 'Hijau · 3 getaran pendek',
  },
  history: { subtitle: 'Suara yang terdeteksi hari ini', empty: 'Belum ada riwayat', emptySub: 'Setiap suara yang dikenali akan dicatat di sini beserta waktu dan jenisnya.' },
  help: {
    guidebookSub: 'Cara memasang, mengatur, dan arti tiap kode',
    trainingSub: 'Latih anak mengenali kode',
    about: 'Tentang',
    aboutText: 'Tugas Teknologi Asistif, S1 Pendidikan Khusus, Universitas Negeri Surabaya, 2026.',
    language: 'Bahasa',
  },
  screens: { login: 'Masuk', profile: 'Profil anak', connect: 'Sambungkan gelang', training: 'Mode latihan', guidebook: 'Buku panduan' },
  stub: { madeOnStep: 'Layar ini dibuat pada langkah', back: 'Kembali ke Beranda' },
}

const en: typeof id = {
  appName: 'Vibration and Light Assistive Bracelet',
  nav: { home: 'Home', settings: 'Settings', history: 'History', help: 'Help' },
  home: {
    connected: 'Bracelet connected',
    statusStub: 'Bracelet status and the call button will appear here (step 3).',
    call: 'Call the child now',
    profile: 'Child profile', profileSub: 'Names and bracelet',
    connect: 'Connect bracelet', connectSub: 'Bluetooth',
    training: 'Training mode', trainingSub: 'Try every vibration and colour',
    guidebook: 'Guidebook', guidebookSub: 'For carers and the child',
  },
  settings: {
    subtitle: 'Sounds to detect',
    stub: 'Switches and sensitivity are added in step 3.',
    alwaysOn: 'always on',
  },
  signals: {
    name: 'Name called', nameSub: 'Blue · 2 short vibrations',
    danger: 'Alarm / danger', dangerSub: 'Red · long repeated vibration',
    bell: 'School bell', bellSub: 'Yellow · 1 medium vibration',
    home: 'Doorbell / knock', homeSub: 'Green · 3 short vibrations',
  },
  history: { subtitle: 'Sounds detected today', empty: 'No history yet', emptySub: 'Every recognised sound will be logged here with its time and type.' },
  help: {
    guidebookSub: 'How to set up, configure, and what each code means',
    trainingSub: 'Train the child to recognise the codes',
    about: 'About',
    aboutText: 'Assistive Technology course, Special Education, Universitas Negeri Surabaya, 2026.',
    language: 'Language',
  },
  screens: { login: 'Sign in', profile: 'Child profile', connect: 'Connect bracelet', training: 'Training mode', guidebook: 'Guidebook' },
  stub: { madeOnStep: 'This screen is built in step', back: 'Back to Home' },
}

export const dict: Record<Lang, typeof id> = { id, en }
export type Dict = typeof id

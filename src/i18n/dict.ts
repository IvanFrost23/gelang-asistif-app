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
  login: {
    title: 'Masuk', subtitle: 'Akun orang tua atau guru', email: 'Email', password: 'Kata sandi',
    submit: 'Masuk', hint: 'Prototipe: email apa pun diterima, tanpa verifikasi.', forgot: 'Lupa kata sandi?',
    signedAs: 'Masuk sebagai', signOut: 'Keluar',
  },
  profile: {
    subtitle: 'Nama anak dan nama panggilan', name: 'Nama anak', namePh: 'Misalnya Nadiyya',
    callNames: 'Nama panggilan yang dikenali', callNamesHint: 'Boleh lebih dari satu: nama lengkap, panggilan di sekolah, panggilan di rumah.',
    addName: 'Tambah', namePhCall: 'Misalnya Nad', save: 'Simpan profil', saved: 'Profil tersimpan',
    list: 'Profil anak', newProfile: 'Profil baru', active: 'Aktif', choose: 'Pilih', remove: 'Hapus', empty: 'Belum ada profil anak. Buat profil pertama.',
  },
  connect: {
    subtitle: 'Hubungkan gelang lewat Bluetooth', status: { disconnected: 'Gelang terputus', searching: 'Mencari gelang…', connected: 'Gelang terhubung' },
    search: 'Cari gelang', disconnect: 'Putuskan', found: 'Gelang ditemukan', connectTo: 'Sambungkan',
    step1: 'Tekan tombol di gelang sekali sampai lampu berkedip ungu.', step2: 'Tekan Cari gelang dan pilih gelang dari daftar.', step3: 'Gelang bergetar dua kali bila sambungan berhasil.',
    simNote: 'Prototipe: sambungan Bluetooth disimulasikan.', battery: 'Baterai',
  },
  settingsFull: {
    sensitivity: 'Kepekaan pengenalan', sensLow: 'Rendah', sensMedium: 'Sedang', sensHigh: 'Tinggi',
    sensHint: 'Rendah: lebih sedikit salah deteksi di tempat ramai. Tinggi: lebih sedikit suara terlewat.',
    dangerLocked: 'Kategori bahaya selalu aktif demi keselamatan anak.', saved: 'Pengaturan tersimpan otomatis', account: 'Akun',
  },
  homeFull: { noProfile: 'Belum ada profil anak', createProfile: 'Buat profil anak', signInFirst: 'Masuk untuk mulai', lastEvent: 'Terakhir', noEvents: 'Belum ada suara terdeteksi' },
  historyFull: {
    today: 'Hari ini', yesterday: 'Kemarin', clear: 'Hapus riwayat',
    source: { manual: 'Panggil manual', training: 'Mode latihan', simulator: 'Demo', speech: 'Nama dikenali', yamnet: 'Suara dikenali' },
  },
  sim: {
    title: 'Mode demo', show: 'Tampilkan', hide: 'Sembunyikan',
    hint: 'Untuk presentasi tanpa mikrofon: tekan jenis suara, atau jalankan rangkaian otomatis.',
    start: 'Jalankan rangkaian demo', stop: 'Hentikan demo',
  },
  bracelet: { stop: 'Hentikan getaran', idle: 'Gelang siap', playing: 'Gelang bergetar', noVibrate: 'Getaran nyata hanya terasa di ponsel Android.' },
  training: { subtitle: 'Tekan kode, rasakan getaran, lihat warna', tryIt: 'Coba kode' },
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
  login: {
    title: 'Sign in', subtitle: 'Parent or teacher account', email: 'Email', password: 'Password',
    submit: 'Sign in', hint: 'Prototype: any email is accepted, no verification.', forgot: 'Forgot password?',
    signedAs: 'Signed in as', signOut: 'Sign out',
  },
  profile: {
    subtitle: "Child's name and call names", name: "Child's name", namePh: 'e.g. Nadiyya',
    callNames: 'Names the child is called by', callNamesHint: 'More than one is fine: full name, school nickname, home nickname.',
    addName: 'Add', namePhCall: 'e.g. Nad', save: 'Save profile', saved: 'Profile saved',
    list: 'Child profiles', newProfile: 'New profile', active: 'Active', choose: 'Select', remove: 'Remove', empty: 'No child profiles yet. Create the first one.',
  },
  connect: {
    subtitle: 'Connect the bracelet over Bluetooth', status: { disconnected: 'Bracelet disconnected', searching: 'Searching for bracelet…', connected: 'Bracelet connected' },
    search: 'Search for bracelet', disconnect: 'Disconnect', found: 'Bracelet found', connectTo: 'Connect',
    step1: 'Press the bracelet button once until the light blinks purple.', step2: 'Tap Search and choose the bracelet from the list.', step3: 'The bracelet vibrates twice when connected.',
    simNote: 'Prototype: the Bluetooth connection is simulated.', battery: 'Battery',
  },
  settingsFull: {
    sensitivity: 'Recognition sensitivity', sensLow: 'Low', sensMedium: 'Medium', sensHigh: 'High',
    sensHint: 'Low: fewer false alerts in noisy places. High: fewer missed sounds.',
    dangerLocked: "The danger category is always on for the child's safety.", saved: 'Settings are saved automatically', account: 'Account',
  },
  homeFull: { noProfile: 'No child profile yet', createProfile: 'Create child profile', signInFirst: 'Sign in to start', lastEvent: 'Last', noEvents: 'No sounds detected yet' },
  historyFull: {
    today: 'Today', yesterday: 'Yesterday', clear: 'Clear history',
    source: { manual: 'Manual call', training: 'Training mode', simulator: 'Demo', speech: 'Name recognised', yamnet: 'Sound recognised' },
  },
  sim: {
    title: 'Demo mode', show: 'Show', hide: 'Hide',
    hint: 'For presenting without a microphone: tap a sound type, or run the automatic sequence.',
    start: 'Run demo sequence', stop: 'Stop demo',
  },
  bracelet: { stop: 'Stop vibration', idle: 'Bracelet ready', playing: 'Bracelet vibrating', noVibrate: 'Real vibration is felt only on an Android phone.' },
  training: { subtitle: 'Press a code, feel the vibration, see the colour', tryIt: 'Try a code' },
}

export const dict: Record<Lang, typeof id> = { id, en }
export type Dict = typeof id

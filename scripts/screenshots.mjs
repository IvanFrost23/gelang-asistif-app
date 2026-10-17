// Снимает все экраны приложения для документации: node scripts/screenshots.mjs [baseUrl]
import puppeteer from 'puppeteer-core'
import { SEED } from './seed.mjs'
const base = process.argv[2] || 'http://localhost:5173'
const out = 'docs/screens'
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width: 390, height: 800, deviceScaleFactor: 2 })
const wait = ms => new Promise(r => setTimeout(r, ms))
const go = async (path) => { await p.goto(base + path, { waitUntil: 'domcontentloaded' }); await wait(700) }
const shot = (n) => p.screenshot({ path: `${out}/${n}.png` })

await go('/'); await p.evaluate(() => localStorage.clear()); await go('/')
await shot('01-beranda-belum-masuk')
await go('/masuk'); await p.type('#email', 'guru@sekolah.id'); await p.type('#password', '••••••••'); await shot('02-masuk')
await p.evaluate((s) => localStorage.setItem('gelang-asistif', s), SEED)
await go('/profil'); await shot('03-profil-anak')
await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('gelang-asistif')); s.state.bracelet = 'disconnected'; localStorage.setItem('gelang-asistif', JSON.stringify(s)) })
await go('/sambungkan'); await shot('04-sambungkan-gelang')
await p.click('.btn'); await wait(2000); await shot('05-gelang-ditemukan')
await p.click('.row .btn'); await wait(80); await shot('06-gelang-terhubung')
await go('/'); await shot('07-beranda')
await p.click('.sim .link'); await wait(100); await shot('08-beranda-mode-demo')
const chips = await p.$$('.sim .chip'); await chips[1].click(); await wait(60); await shot('09-beranda-sinyal-bahaya')
await go('/pengaturan'); await shot('10-pengaturan')
await go('/latihan'); const btns = await p.$$('.signal-grid button'); await btns[0].click(); await wait(60); await shot('11-mode-latihan')
await go('/riwayat'); await shot('12-riwayat')
await go('/panduan'); await shot('13-panduan-pendamping')
const seg = await p.$$('.seg button'); await seg[1].click(); await wait(100); await shot('14-panduan-anak')
await go('/bantuan'); await p.click('.faq-q'); await wait(80); await shot('15-bantuan')
await b.close()
console.log('screens saved to', out)

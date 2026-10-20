// Картинки для промо-страницы /gelang/: превью для соцсетей и запасной рендер браслета без WebGL.
// Запуск при работающем dev-сервере: node scripts/promo-assets.mjs [baseUrl]
import puppeteer from 'puppeteer-core'
const base = process.argv[2] || 'http://localhost:5173'
const out = 'public/gelang'
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const p = await b.newPage()
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

// Дождаться, когда hero покажет нужный код: первые 1.8 с LED «дышит», дальше коды по 3.2 с (синий, красный, жёлтый, зелёный)
async function waitForCode(index) {
  for (;;) {
    const now = await p.evaluate(() => performance.now())
    const ms = now - 1800
    if (ms > 0 && Math.floor(ms / 3200) % 4 === index && ms % 3200 > 250 && ms % 3200 < 700) return
    await wait(40)
  }
}

await p.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 })
await p.goto(base + '/gelang/?lang=id', { waitUntil: 'networkidle0' })
await p.addStyleTag({ content: '.scroll-cue,.nav{display:none!important} .hero{min-height:630px;padding:0 0 0} .hero-stage{height:600px}' })
await wait(800)
await waitForCode(0)
await p.screenshot({ path: `${out}/og.png` })

await p.setViewport({ width: 900, height: 900, deviceScaleFactor: 1 })
await p.goto(base + '/gelang/?lang=id', { waitUntil: 'networkidle0' })
await p.addStyleTag({ content: 'html,body,.hero{background:transparent!important} .hero::before,.hero-glow,.hero-copy,.nav,.scroll-cue{display:none!important} .hero{padding:0} .hero-in{display:block;padding:0} .hero-stage{height:880px}' })
await wait(800)
await waitForCode(0)
const stage = await p.$('.hero-stage canvas')
await stage.screenshot({ path: `${out}/bracelet.png`, omitBackground: true })

await b.close()
console.log('saved', `${out}/og.png`, `${out}/bracelet.png`)

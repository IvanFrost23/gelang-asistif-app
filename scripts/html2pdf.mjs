import puppeteer from 'puppeteer-core'
const [src, dst] = process.argv.slice(2)
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const p = await b.newPage()
await p.goto('file://' + src, { waitUntil: 'networkidle0' })
await p.pdf({ path: dst, format: 'A4', printBackground: true, margin: { top: '18mm', bottom: '18mm', left: '16mm', right: '16mm' } })
await b.close()

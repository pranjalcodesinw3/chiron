// shots.cjs BASE OUTPREFIX : 1440x900 and 390x844 viewport + full-page shots of the account page on both chains.
const { chromium } = require(process.env.HOME + '/pwcap/node_modules/playwright')
const EXE = process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell'
const [base, out] = process.argv.slice(2)
;(async () => {
  const b = await chromium.launch({ executablePath: EXE })
  for (const [chain, tag] of [['robinhood', ''], ['arbitrum', '-arb']]) {
    for (const [w, h] of [[1440, 900], [390, 844]]) {
      const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
      await p.goto(`${base}/?chain=${chain}`, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {})
      await p.waitForFunction(() => !/Reading the account/.test(document.body.innerText), null, { timeout: 60000 }).catch(() => {})
      await p.waitForTimeout(1500)
      await p.screenshot({ path: `${out}${tag}-${w}.png` })
      await p.screenshot({ path: `${out}${tag}-full-${w}.png`, fullPage: true })
      const small = await p.evaluate(() => [...document.querySelectorAll('body *')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && parseFloat(getComputedStyle(e).fontSize) < 12).length)
      console.log(chain, w, 'height', await p.evaluate(() => document.body.scrollHeight), 'sub-12px', small)
      await p.close()
    }
  }
  await b.close()
})()

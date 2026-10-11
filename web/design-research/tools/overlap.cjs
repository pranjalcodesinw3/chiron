// overlap.cjs BASE OUTPREFIX : full-page scroll shots at 1440/768/390 on both chains + text overlap/clip detection.
const { chromium } = require(process.env.HOME + '/pwcap/node_modules/playwright')
const EXE = process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell'
const [base, out] = process.argv.slice(2)
;(async () => {
  const b = await chromium.launch({ executablePath: EXE }); let total = 0
  for (const [chain, tag] of [['robinhood', ''], ['arbitrum', '-arb']]) for (const w of [1440, 768, 390]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } })
    await p.goto(`${base}/?chain=${chain}`, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {})
    await p.waitForFunction(() => !/Reading the account/.test(document.body.innerText), null, { timeout: 60000 }).catch(() => {})
    for (let y = 0; y < await p.evaluate(() => document.body.scrollHeight); y += 700) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(150) }
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(1000)
    await p.screenshot({ path: `${out}${tag}-full-${w}.png`, fullPage: true })
    const issues = await p.evaluate(() => {
      const R = []; const range = document.createRange(); const res = []
      for (const e of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(e); if (!e.checkVisibility({ opacityProperty: true, visibilityProperty: true, contentVisibilityAuto: true }) || e.closest('details:not([open]) > :not(summary)')) continue
        for (const n of e.childNodes) if (n.nodeType === 3 && n.textContent.trim()) { range.selectNodeContents(n); for (const r of range.getClientRects()) if (r.width > 1 && r.height > 1) R.push({ r, t: n.textContent.trim().slice(0, 40), e }) }
        if ((e.scrollWidth > e.clientWidth + 1 && /hidden|clip/.test(cs.overflowX) && cs.textOverflow !== 'ellipsis') ) res.push('clipped: ' + e.className + ' "' + e.textContent.trim().slice(0, 40) + '"')
      }
      if (document.documentElement.scrollWidth > innerWidth + 1) res.push('horizontal scroll ' + document.documentElement.scrollWidth)
      for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) {
        const a = R[i].r, c = R[j].r; if (R[i].e === R[j].e) continue
        const ox = Math.min(a.right, c.right) - Math.max(a.left, c.left), oy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top)
        if (ox > 2 && oy > 3) res.push(`overlap: "${R[i].t}" x "${R[j].t}" (${ox.toFixed(0)}x${oy.toFixed(0)})`)
      }
      return res
    })
    total += issues.length; console.log(chain, w, issues.length ? issues.join('\n  ') : 'clean'); await p.close()
  }
  console.log('TOTAL', total); await b.close()
})()

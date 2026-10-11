// contrast.cjs BASE : WCAG 2.1 AA check of every rendered text node (and SVG text) on both chains at 1440 and 390.
// Background = first ancestor with an opaque-ish background, alpha-composited over the canvas. Fails < 4.5 (normal) / 3 (>=24px or >=18.66px bold).
const { chromium } = require(process.env.HOME + '/pwcap/node_modules/playwright')
const EXE = process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell'
const base = process.argv[2]
const inject = process.argv[3] // optional CSS, e.g. ':root{--ink-subtle:#555}' to prove the check goes red
;(async () => {
  const b = await chromium.launch({ executablePath: EXE }); let worst = 99, fails = []
  for (const chain of ['robinhood', 'arbitrum']) for (const [w, h] of [[1440, 900], [390, 844]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } })
    await p.goto(`${base}/?chain=${chain}`, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {})
    if (inject) await p.addStyleTag({ content: inject })
    await p.waitForTimeout(2500)
    const r = await p.evaluate(() => {
      const parse = (c) => { const m = c.match(/[\d.]+/g); if (!m) return null; return m.map(Number).concat(m.length === 3 ? [1] : []).slice(0, 4) }
      const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) }
      const over = (top, bot) => { const a = top[3]; return [0, 1, 2].map((i) => top[i] * a + bot[i] * (1 - a)).concat([1]) }
      const bgOf = (el) => { const stack = []; for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c[3] > 0) { stack.push(c); if (c[3] >= 1) break } } let bg = [8, 9, 10, 1]; for (const c of stack.reverse()) bg = over(c, bg); return bg }
      const out = []
      for (const el of document.querySelectorAll('body *')) {
        const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
        if (!own || !el.getClientRects().length) continue
        const s = getComputedStyle(el); if (s.visibility === 'hidden' || +s.opacity === 0) continue
        const isSvg = el instanceof SVGElement
        let fg = parse(isSvg ? s.fill : s.color); if (!fg) continue
        let bg = bgOf(isSvg ? el.closest('section, div') : el)
        // SVG text drawn on a shape (a chart mark numeral) is read against that shape's fill, composited over the panel.
        const shape = isSvg && el.parentElement && el.parentElement.querySelector('circle, rect')
        if (shape) { const c = parse(getComputedStyle(shape).fill); if (c) bg = over(c, bg) }
        fg = over(fg, bg)
        const L1 = lum(fg), L2 = lum(bg), ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
        const size = parseFloat(s.fontSize), large = size >= 24 || (size >= 18.66 && +s.fontWeight >= 700)
        const disabled = el.closest('button:disabled')
        out.push({ t: el.textContent.trim().slice(0, 40), ratio: +ratio.toFixed(2), size, need: large ? 3 : 4.5, disabled: !!disabled })
      }
      return out
    })
    const bad = r.filter((x) => !x.disabled && x.ratio < x.need)
    const min = Math.min(...r.filter((x) => !x.disabled).map((x) => x.ratio)); worst = Math.min(worst, min)
    console.log(`${chain} ${w}: ${r.length} text nodes, min ratio ${min}, min size ${Math.min(...r.map((x) => x.size))}px, AA failures ${bad.length}`)
    bad.slice(0, 8).forEach((x) => console.log('   FAIL', x.ratio, x.size + 'px', JSON.stringify(x.t)))
    fails.push(...bad); await p.close()
  }
  // WCAG 1.4.11 non-text contrast (3:1): chart marks and lines against the zone wash they sit on, composited over surface-1.
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
  const L = (c) => 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); function f(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
  const mix = (c, a, bg) => c.map((v, i) => v * a + bg[i] * (1 - a)); const s1 = hex('#0f1011')
  const R = (a, b) => (Math.max(L(a), L(b)) + 0.05) / (Math.min(L(a), L(b)) + 0.05)
  // Colors read from the rendered RHC page (computed fill/stroke), not constants.
  const pg = await b.newPage({ viewport: { width: 1440, height: 900 } })
  await pg.goto(`${base}/?chain=robinhood`, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {})
  if (inject) await pg.addStyleTag({ content: inject })
  await pg.waitForSelector('.mk circle', { timeout: 60000 }).catch(() => {})
  const C = await pg.evaluate(() => {
    const g = (sel, prop) => { const e = document.querySelector(sel); if (!e) return null; const cs = getComputedStyle(e); return { c: cs[prop], o: parseFloat(cs.fillOpacity || '1') } }
    const s1 = getComputedStyle(document.documentElement).getPropertyValue('--surface-1').trim()
    return { s1, ok: g('.mk-executed circle', 'fill'), bad: g('.mk-refused circle', 'fill'), lw: g('.l-warn', 'stroke'), lb: g('.l-bad', 'stroke'), zo: g('.z-ok', 'fill'), zw: g('.z-warn', 'fill'), zb: g('.z-bad', 'fill'), ring: g('.mk-approved circle', 'stroke') }
  })
  await pg.close()
  const rgba = (x) => { if (!x) return null; const m = x.c.match(/[\d.]+/g).map(Number); return { rgb: m.slice(0, 3), a: (m.length > 3 ? m[3] : 1) * x.o } }
  const s1c = hex(C.s1.length === 7 ? C.s1 : '#0f1011')
  const zone = (z) => { const v = rgba(z); return v ? mix(v.rgb, v.a, s1c) : s1c }
  const fg = (x) => rgba(x)?.rgb
  const nt = [['mint mark on executes zone', fg(C.ok), zone(C.zo)], ['amber line on approval zone', fg(C.lw), zone(C.zw)], ['red mark on approval zone', fg(C.bad), zone(C.zw)], ['red line on revert zone', fg(C.lb), zone(C.zb)], ['mint ring on approval zone', fg(C.ring) || fg(C.ok), zone(C.zw)]]
  for (const [n, a] of nt) if (!a) { console.log(`non-text ${n}: element missing FAIL`); fails.push({ t: n }) }
  nt.splice(0, nt.length, ...nt.filter(([, a]) => a))
  console.log('non-text colors (computed):', JSON.stringify(C))
  for (const [n, a, bg] of nt) { const r = R(a, bg); console.log(`non-text ${n}: ${r.toFixed(2)}${r < 3 ? ' FAIL' : ''}`); if (r < 3) fails.push({ t: n }) }
  await b.close(); console.log(fails.length ? `AA: ${fails.length} failures` : `AA: pass (worst ratio ${worst})`); process.exit(fails.length ? 1 : 0)
})()

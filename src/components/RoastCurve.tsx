import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CurveGL } from '../lib/curve3d'
import { clamp, reduce } from '../lib/env'
import {
  BOUND_NAMES, BOUNDS, dense, fmt, MAXT, PROF, stageAt, tempAt, YMAX, YMIN, type Profile,
} from '../lib/roast'
import { jumpToProfile, roastPin } from '../lib/roastPin'
import { gsap, ScrollTrigger } from '../lib/scroll'

const PROFILES: { id: Profile; label: string }[] = [
  { id: 'clara', label: 'Clara · 10:30' },
  { id: 'media', label: 'Média · 12:00' },
  { id: 'escura', label: 'Escura · 13:30' },
]

/** Seção fixa na tela: a rolagem avança o tempo da torra, e o grão 3D, o gráfico e os textos acompanham. */
export function RoastCurve() {
  const sec = useRef<HTMLElement>(null)
  const cv = useRef<HTMLCanvasElement>(null)
  const chartBox = useRef<HTMLDivElement>(null)
  const fg = useRef<SVGPathElement>(null)
  const cur = useRef<SVGLineElement>(null)
  const head = useRef<SVGCircleElement>(null)
  const elTime = useRef<HTMLDivElement>(null)
  const elTemp = useRef<HTMLDivElement>(null)
  const elStage = useRef<HTMLElement>(null)
  const elNote = useRef<HTMLParagraphElement>(null)

  const [size, setSize] = useState({ W: 800, H: 200 })
  const [near, setNear] = useState<Profile | null>(null)
  const run = useRef({ t: 0, target: 0, last: -9, live: false, len: 0, near: null as Profile | null, text: '' })
  const gl = useRef<CurveGL | null>(null)

  // geometria do gráfico (recalculada quando a largura muda)
  const geo = useMemo(() => {
    const { W, H } = size
    const m = { l: 40, r: 10, t: 22, b: 22 }
    const X = (v: number) => m.l + (v / MAXT) * (W - m.l - m.r)
    const Y = (v: number) => m.t + (1 - (v - YMIN) / (YMAX - YMIN)) * (H - m.t - m.b)
    const d = dense.map((p, i) => (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join('')
    return { W, H, m, X, Y, d }
  }, [size])

  // medida do gráfico
  useLayoutEffect(() => {
    const box = chartBox.current!
    const measure = () =>
      setSize({
        W: Math.max(280, box.clientWidth),
        H: clamp(Math.round(innerHeight * (innerWidth < 860 ? 0.17 : 0.26)), 110, 260),
      })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(box)
    return () => ro.disconnect()
  }, [])

  // desenha o estado atual (cursor, trecho percorrido, textos, grão 3D)
  const paint = (force = false) => {
    const r = run.current, { X, Y } = geo, t = r.t, T = tempAt(t), x = X(t), y = Y(T)
    if (fg.current) {
      let acc = 0, target = 0
      for (let i = 1; i < dense.length; i++) {
        const seg = Math.hypot(X(dense[i][0]) - X(dense[i - 1][0]), Y(dense[i][1]) - Y(dense[i - 1][1]))
        if (dense[i][0] > t) { target = acc + Math.hypot(x - X(dense[i - 1][0]), y - Y(dense[i - 1][1])); break }
        acc += seg
        target = acc
      }
      fg.current.style.strokeDasharray = String(r.len)
      fg.current.style.strokeDashoffset = String(r.len - target)
    }
    cur.current?.setAttribute('x1', String(x))
    cur.current?.setAttribute('x2', String(x))
    head.current?.setAttribute('cx', String(x))
    head.current?.setAttribute('cy', String(y))
    const n = (Object.keys(PROF) as Profile[]).find((k) => Math.abs(t - PROF[k]) < 0.3) ?? null
    if (n !== r.near) { r.near = n; setNear(n) }
    const st = stageAt(t), txt = fmt(t) + '|' + Math.round(T) + '|' + st.n
    if (txt !== r.text || force) {
      r.text = txt
      if (elTime.current) elTime.current.textContent = fmt(t)
      if (elTemp.current) elTemp.current.textContent = Math.round(T) + ' °C'
      if (elStage.current) elStage.current.textContent = st.n
      if (elNote.current) elNote.current.textContent = st.t
    }
  }
  const paintRef = useRef(paint)
  useLayoutEffect(() => { paintRef.current = paint })

  // ao redesenhar o SVG, mede o comprimento da linha e repinta
  useLayoutEffect(() => {
    if (fg.current) run.current.len = fg.current.getTotalLength()
    paintRef.current(true)
    run.current.last = -9
  }, [geo])

  // grão 3D (three.js carregado à parte)
  useLayoutEffect(() => {
    let cancelled = false
    import('../lib/curve3d').then(({ createCurveGL }) => {
      if (cancelled) return
      gl.current = createCurveGL(cv.current!)
    })
    return () => {
      cancelled = true
      gl.current?.dispose()
      gl.current = null
    }
  }, [])

  // seção fixa + laço de animação
  useLayoutEffect(() => {
    const r = run.current
    const pin = ScrollTrigger.create({
      trigger: sec.current, start: 'top top', end: '+=380%', pin: true, anticipatePin: 1,
      onUpdate: (s) => { r.target = s.progress * MAXT },
      onToggle: (s) => { r.live = s.isActive },
    })
    const vis = ScrollTrigger.create({
      trigger: sec.current, start: 'top bottom', end: 'bottom top',
      onToggle: (s) => { r.live = s.isActive },
    })
    roastPin.st = pin
    const tick = () => {
      if (!r.live) return
      r.t += (r.target - r.t) * (reduce ? 1 : 0.14)
      if (Math.abs(r.target - r.t) < 0.002) r.t = r.target
      const dirty = gl.current?.consumeDirty() ?? false
      if (Math.abs(r.t - r.last) < 1e-4 && !dirty) return
      r.last = r.t
      paintRef.current()
      gl.current?.render(r.t)
    }
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      pin.kill()
      vis.kill()
      roastPin.st = null
    }
  }, [])

  const { W, H, m, X, Y } = geo
  const bands = BOUNDS.slice(1, -1).map((b, i) => {
    const idx = i + 1, x0 = X(b), x1 = X(BOUNDS[idx + 1]), w = x1 - x0
    const name = BOUND_NAMES[idx]
    return { x0, w, name, show: w > name.length * 6.4 + 6, shade: idx % 2 === 1 }
  })

  return (
    <section className="curve" id="curva" data-h="dark" aria-label="Curva de torra controlada pela rolagem" ref={sec}>
      <div className="grid">
        <div className="c-text">
          <div className="c-kicker">Role a página para avançar o tempo da torra</div>
          <div className="c-time" ref={elTime}>0:00</div>
          <div className="c-temp" ref={elTemp}>195 °C</div>
          <div className="c-stage" aria-live="polite">
            <strong ref={elStage}>Carga</strong>
            <p ref={elNote}>O grão verde cai no tambor aquecido.</p>
          </div>
        </div>
        <div className="c-glass">
          <canvas id="rCv" ref={cv} aria-hidden="true" />
          <div className="c-profiles" role="group" aria-label="Ir ao ponto de saída">
            {PROFILES.map((p) => (
              <button key={p.id} type="button" className={near === p.id ? 'on' : ''} onClick={() => jumpToProfile(p.id)}>{p.label}</button>
            ))}
          </div>
        </div>
        <div className="c-chart" ref={chartBox}>
          <svg id="rChart" role="img" aria-label="Gráfico da temperatura do grão ao longo do tempo de torra" viewBox={`0 0 ${W} ${H}`} height={H}>
            {bands.map((b) => (
              <g key={b.name}>
                <rect x={b.x0} y={m.t} width={b.w} height={H - m.t - m.b} fill="#fff" opacity={b.shade ? 0.07 : 0} />
                {b.show && <text x={b.x0 + b.w / 2} y={m.t - 8} fontSize="10" textAnchor="middle">{b.name}</text>}
              </g>
            ))}
            {[100, 140, 180, 220].map((v) => (
              <g key={v}>
                <line x1={m.l} x2={W - m.r} y1={Y(v)} y2={Y(v)} stroke="#fff" opacity=".16" />
                <text x={m.l - 7} y={Y(v) + 3.5} fontSize="10" textAnchor="end">{v}</text>
              </g>
            ))}
            {[0, 2, 4, 6, 8, 10, 12, 14].map((v) => (
              <text key={v} x={X(v)} y={H - 6} fontSize="10" textAnchor="middle">{v}'</text>
            ))}
            {(Object.entries(PROF) as [Profile, number][]).map(([k, t]) => {
              const x = X(t), y = Y(tempAt(t)), on = near === k
              return (
                <g key={k}>
                  <line x1={x} x2={x} y1={y} y2={H - m.b} stroke="#F4B72E" strokeDasharray="3 4" opacity=".5" />
                  <circle cx={x} cy={y} r={on ? 7 : 4.5} fill={on ? '#F4B72E' : '#2B3BE0'} stroke="#F4B72E" strokeWidth="2" />
                </g>
              )
            })}
            <path d={geo.d} fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth="3" strokeLinejoin="round" />
            <path ref={fg} d={geo.d} fill="none" stroke="#F4B72E" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
            <line ref={cur} y1={m.t} y2={H - m.b} stroke="#F4F5EC" strokeWidth="1.5" />
            <circle ref={head} r="7" fill="#F4F5EC" stroke="#F4B72E" strokeWidth="3.5" />
          </svg>
        </div>
      </div>
    </section>
  )
}

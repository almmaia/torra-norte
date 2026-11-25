import { clamp, reduce } from './env'
import { gsap } from './scroll'

interface Bean {
  side: -1 | 1
  home: number // posição vertical de origem (0 a 1)
  depth: number // 0,3 a 1: quanto mais perto, mais rápido e maior
  r: number // raio em px
  tone: number // 0 clara, 1 média, 2 escura
  ox: number; vx: number // deslocamento horizontal (mola)
  oy: number; vy: number // deslocamento vertical (mola)
  rot: number; vr: number // giro
  seed: number
}

const TONES = [
  ['#C98B4E', '#8A5429', '#4A2A15'],
  ['#A8693A', '#6E3F20', '#38200F'],
  ['#7E4A27', '#4F2C16', '#25140A'],
]

/**
 * Grãos de café nas margens da página. Com a rolagem eles descem em ritmos diferentes, são empurrados,
 * quicam de volta (mola) e giram. Parados, não gastam nada: o desenho só roda enquanto há movimento.
 */
export function createScrollBeans(canvas: HTMLCanvasElement) {
  if (reduce) return () => {}
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}

  let W = 0, H = 0, dpr = 1
  let beans: Bean[] = []

  const build = () => {
    dpr = Math.min(devicePixelRatio || 1, 1.5)
    W = canvas.clientWidth
    H = canvas.clientHeight
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    const n = W > 1100 ? 12 : W > 700 ? 8 : 6
    const gut = Math.max(16, W * 0.04)
    beans = Array.from({ length: n }, (_, i) => {
      const depth = 0.35 + Math.random() * 0.65
      const wide = W > 700
      const r = wide ? clamp(gut * (0.16 + depth * 0.22), 7, 16) : 7 + depth * 8
      return {
        side: i % 2 ? 1 : -1, home: (i + Math.random() * 0.8) / n, depth, r,
        tone: Math.floor(Math.random() * 3),
        ox: 0, vx: 0, oy: 0, vy: 0, rot: Math.random() * 6, vr: 0, seed: Math.random() * 6,
      }
    })
    needsDraw = true
  }

  let lastY = window.scrollY
  let needsDraw = true
  let T = 0
  build()
  const ro = new ResizeObserver(build)
  ro.observe(canvas)

  const draw = (b: Bean, x: number, y: number) => {
    const c = ctx
    const t = TONES[b.tone]
    c.save()
    c.translate(x, y)
    c.rotate(b.rot)
    c.shadowColor = 'rgba(0,0,0,.35)'
    c.shadowBlur = b.r * 0.9
    c.shadowOffsetY = b.r * 0.25
    const g = c.createRadialGradient(-b.r * 0.3, -b.r * 0.45, b.r * 0.1, 0, 0, b.r * 1.3)
    g.addColorStop(0, t[0])
    g.addColorStop(0.55, t[1])
    g.addColorStop(1, t[2])
    c.fillStyle = g
    c.beginPath()
    c.ellipse(0, 0, b.r * 0.74, b.r, 0, 0, Math.PI * 2)
    c.fill()
    c.shadowColor = 'transparent'
    // sulco central
    c.strokeStyle = 'rgba(20,10,4,.8)'
    c.lineWidth = Math.max(1.2, b.r * 0.13)
    c.lineCap = 'round'
    c.beginPath()
    c.moveTo(-b.r * 0.08, -b.r * 0.86)
    c.bezierCurveTo(b.r * 0.34, -b.r * 0.3, -b.r * 0.34, b.r * 0.3, b.r * 0.08, b.r * 0.86)
    c.stroke()
    // brilho
    c.fillStyle = 'rgba(255,238,210,.28)'
    c.beginPath()
    c.ellipse(-b.r * 0.32, -b.r * 0.38, b.r * 0.16, b.r * 0.34, -0.5, 0, Math.PI * 2)
    c.fill()
    c.restore()
  }

  const tick = (_t: number, dtMs: number) => {
    const dt = Math.min(2, dtMs / 16.67)
    T += dt
    const y = window.scrollY
    const dy = y - lastY
    lastY = y
    let moving = Math.abs(dy) > 0.01
    for (const b of beans) {
      // a rolagem chuta o grão (mais forte nos de perto) e gira
      b.vy += -dy * (0.05 + b.depth * 0.05) * dt
      b.vx += -b.side * Math.abs(dy) * 0.012 * b.depth * dt
      b.vr += dy * 0.0026 * b.depth * dt
      // mola de volta + atrito
      b.vy += -b.oy * 0.055 * dt
      b.vx += -b.ox * 0.06 * dt
      b.vy *= Math.pow(0.9, dt)
      b.vx *= Math.pow(0.88, dt)
      b.vr *= Math.pow(0.95, dt)
      b.oy = clamp(b.oy + b.vy * dt, -90, 90)
      b.ox = clamp(b.ox + b.vx * dt, -12, 12)
      b.rot += b.vr * dt
      if (Math.abs(b.vy) > 0.03 || Math.abs(b.vx) > 0.03 || Math.abs(b.vr) > 0.0008 || Math.abs(b.oy) > 0.2) moving = true
    }
    if (!moving && !needsDraw) return
    needsDraw = false
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    const span = H + 120
    const gut = Math.max(16, W * 0.04)
    for (const b of beans) {
      // desce devagar enquanto a página rola; cada grão no seu ritmo
      const py = (((b.home * span - y * b.depth * 0.32) % span) + span) % span - 60
      const wide = W > 700
      const cx = wide ? (b.side < 0 ? gut * 0.4 : W - gut * 0.4) : (b.side < 0 ? 2 : W - 2)
      draw(b, cx + b.ox + Math.sin(T * 0.02 + b.seed) * 1.5, py + b.oy)
    }
  }
  gsap.ticker.add(tick)
  return () => {
    gsap.ticker.remove(tick)
    ro.disconnect()
  }
}

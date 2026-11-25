import { Fragment, useEffect, useRef } from 'react'
import { reduce } from '../lib/env'
import { getLenis, gsap } from '../lib/scroll'

const ORIGINS = ['Mantiqueira', 'Cerrado Mineiro', 'Sul de Minas', 'Torra clara']

function Bean() {
  return (
    <svg viewBox="0 0 32 32"><ellipse cx="16" cy="16" rx="9.5" ry="13" transform="rotate(25 16 16)" fill="#2B3BE0" /></svg>
  )
}

function OriginSet() {
  return (
    <div className="set">
      {ORIGINS.map((o) => (
        <Fragment key={o}>
          <span>{o}</span>
          <Bean />
        </Fragment>
      ))}
    </div>
  )
}

/** Faixa de origens que corre sozinha e acelera (e inverte) com a rolagem. */
export function Marquee() {
  const row = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = row.current!
    const first = el.children[0] as HTMLElement
    let x = 0, dir = -1
    const tick = () => {
      const w = first.getBoundingClientRect().width
      if (!w) return
      const v = getLenis()?.velocity ?? 0
      if (v > 0.1) dir = -1
      else if (v < -0.1) dir = 1
      x += dir * 1.4 * (reduce ? 0.3 : 1) * (1 + Math.min(6, Math.abs(v) * 0.35))
      if (x <= -w) x += w
      if (x > 0) x -= w
      el.style.transform = `translate3d(${x}px,0,0)`
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])

  return (
    <div className="band" aria-hidden="true">
      <div className="row" ref={row}>
        <OriginSet />
        <OriginSet />
      </div>
    </div>
  )
}

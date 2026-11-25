import { useEffect, useRef } from 'react'
import { fine, reduce } from '../lib/env'
import { gsap } from '../lib/scroll'

/** Bolinha que segue o mouse e cresce sobre links e botões. Só aparece com mouse de verdade. */
export function Cursor() {
  const el = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!fine || reduce || !el.current) return
    const c = el.current
    const qx = gsap.quickTo(c, 'x', { duration: 0.2, ease: 'power3' })
    const qy = gsap.quickTo(c, 'y', { duration: 0.2, ease: 'power3' })
    const move = (e: PointerEvent) => {
      qx(e.clientX)
      qy(e.clientY)
      c.style.opacity = '1'
    }
    const over = (e: Event) => { if ((e.target as Element).closest('a, button')) c.classList.add('big') }
    const out = (e: Event) => { if ((e.target as Element).closest('a, button')) c.classList.remove('big') }
    addEventListener('pointermove', move, { passive: true })
    document.addEventListener('mouseover', over)
    document.addEventListener('mouseout', out)
    return () => {
      removeEventListener('pointermove', move)
      document.removeEventListener('mouseover', over)
      document.removeEventListener('mouseout', out)
    }
  }, [])
  return <div id="cur" ref={el} aria-hidden="true" />
}

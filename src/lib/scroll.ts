import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { reduce } from './env'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null

/** Liga o scroll suave (Lenis) ao ticker do GSAP. Devolve a função de limpeza. */
export function startScroll() {
  if (reduce) return () => {}
  lenis = new Lenis({ lerp: 0.1 })
  lenis.on('scroll', ScrollTrigger.update)
  const tick = (t: number) => lenis?.raf(t * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return () => {
    gsap.ticker.remove(tick)
    lenis?.destroy()
    lenis = null
  }
}

export const getLenis = () => lenis

export function goY(y: number, duration = 1.6) {
  if (lenis) lenis.scrollTo(y, { duration })
  else window.scrollTo({ top: y, behavior: 'smooth' })
}

/** Rola até o elemento com o id (ex.: "#lotes"). */
export function goTo(hash: string, duration = 1.4) {
  const el = document.querySelector<HTMLElement>(hash)
  if (!el) return false
  goY(el.getBoundingClientRect().top + window.scrollY, duration)
  return true
}

export type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger'
export { gsap, ScrollTrigger }

import { useLayoutEffect, type RefObject } from 'react'
import { reduce } from './env'
import { gsap } from './scroll'

/** Move cada imagem com data-par="-9" dentro do container em ritmo diferente do scroll (parallax). */
export function useParallax(scope: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    if (reduce || !scope.current) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLImageElement>('img[data-par]').forEach((img) => {
        gsap.fromTo(
          img,
          { yPercent: 0 },
          {
            yPercent: parseFloat(img.dataset.par ?? '0'),
            ease: 'none',
            scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })
    }, scope)
    return () => ctx.revert()
  }, [scope])
}

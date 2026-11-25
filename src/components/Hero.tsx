import { useEffect, useLayoutEffect, useRef } from 'react'
import { reduce } from '../lib/env'
import type { HeroScene } from '../lib/hero3d'
import { gsap } from '../lib/scroll'
import { SplitHeading } from './Words'

/** Abertura: grão 3D, título que sobe palavra por palavra e chamada para os lotes. */
export function Hero({ go }: { go: boolean }) {
  const sec = useRef<HTMLElement>(null)
  const cv = useRef<HTMLCanvasElement>(null)
  const scene = useRef<HeroScene | null>(null)

  const goRef = useRef(go)
  useEffect(() => { goRef.current = go }, [go])

  // abertura: o grão cresce e gira até a posição final (só depois de a cena existir e a página liberar)
  const startIntro = () => {
    if (reduce || !goRef.current || !scene.current) return
    gsap.to(scene.current.st, { intro: 1, duration: 2.2, ease: 'expo.out', delay: 0.2 })
  }

  // a cena 3D (three.js) é carregada à parte, para não atrasar o primeiro desenho da página
  useLayoutEffect(() => {
    let cancelled = false
    const words = sec.current!.querySelectorAll('h1 .i')
    if (!reduce) gsap.set(words, { yPercent: 118 })
    import('../lib/hero3d')
      .then(({ createHero }) => {
        if (cancelled) return
        const s = createHero(cv.current!, sec.current!)
        if (!s) { document.documentElement.classList.add('no-webgl'); return }
        scene.current = s
        startIntro()
      })
      .catch(() => document.documentElement.classList.add('no-webgl'))
    return () => {
      cancelled = true
      scene.current?.dispose()
      scene.current = null
      gsap.set(words, { clearProps: 'transform' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!go || reduce) return
    startIntro()
    const ctx = gsap.context(() => {
      gsap.to('h1 .i', { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07, delay: 0.55 })
      gsap.from('.side', { opacity: 0, y: 18, duration: 0.9, ease: 'expo.out', delay: 0.9 })
    }, sec)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [go])

  return (
    <section className="hero" id="hero" data-h="dark" ref={sec}>
      <div className="mark" aria-hidden="true">TORRA NORTE</div>
      <canvas id="heroCv" ref={cv} aria-hidden="true" />
      <div className="copy">
        <div className="wrap">
          <SplitHeading as="h1" text="Cada lote tem a sua curva." reveal={false} />
          <div className="side">
            <p>Café especial torrado em Porto Alegre, com o perfil de cada lote publicado. Role a página e acompanhe um grão da cor verde ao escuro.</p>
            <div className="btns">
              <a className="btn sun" href="#curva" data-mag>Ver a torra</a>
              <a className="btn line" href="#lotes" data-mag>Lotes da semana</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

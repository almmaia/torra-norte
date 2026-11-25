import { Fragment, useLayoutEffect, useRef } from 'react'
import { reduce } from '../lib/env'
import { gsap } from '../lib/scroll'

const TEXT = 'Torramos pequeno para errar menos e acertar o ponto de cada grão.'

/** Frase de destaque: as palavras acendem conforme a rolagem. */
export function Statement() {
  const p = useRef<HTMLParagraphElement>(null)
  useLayoutEffect(() => {
    if (reduce) return
    const words = p.current!.querySelectorAll('.s')
    const tw = gsap.to(words, {
      opacity: 1, stagger: 0.12, ease: 'none',
      scrollTrigger: { trigger: p.current, start: 'top 80%', end: 'bottom 45%', scrub: true },
    })
    return () => {
      tw.scrollTrigger?.kill()
      tw.kill()
      gsap.set(words, { clearProps: 'opacity' })
    }
  }, [])
  const words = TEXT.split(' ')
  return (
    <section className="statement" data-h="light">
      <div className="wrap">
        <p ref={p} aria-label={TEXT}>
          {words.map((w, i) => (
            <Fragment key={i}>
              <span className="s" aria-hidden="true" style={reduce ? { opacity: 1 } : undefined}>{w}</span>
              {i < words.length - 1 ? ' ' : ''}
            </Fragment>
          ))}
        </p>
        <small>Cada lote passa por prova de cor, registro da curva e degustação antes de ser liberado. Se o resultado não bate com o planejado, o lote não sai.</small>
      </div>
    </section>
  )
}

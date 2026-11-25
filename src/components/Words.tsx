import { createElement, Fragment, useLayoutEffect, useRef } from 'react'
import { reduce } from '../lib/env'
import { gsap, ScrollTrigger } from '../lib/scroll'

/** Divide o texto em palavras, cada uma dentro de uma "janela" para o efeito de subida. */
export function Words({ text }: { text: string }) {
  const words = text.trim().split(/\s+/)
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="w" aria-hidden="true"><span className="i">{w}</span></span>
          {i < words.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </>
  )
}

interface Props {
  as?: 'h1' | 'h2' | 'h3'
  className?: string
  text: string
  /** Anima as palavras quando o título entra na tela. Desligue quando outra cena controla a entrada. */
  reveal?: boolean
}

export function SplitHeading({ as = 'h2', className, text, reveal = true }: Props) {
  const ref = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!reveal || reduce || !el) return
    const w = el.querySelectorAll('.i')
    gsap.set(w, { yPercent: 118 })
    const st = ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => gsap.to(w, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.06 }),
    })
    return () => {
      st.kill()
      gsap.killTweensOf(w)
      gsap.set(w, { clearProps: 'transform' })
    }
  }, [reveal])
  return createElement(as, { ref, className, 'aria-label': text }, <Words text={text} />)
}

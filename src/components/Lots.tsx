import { useLayoutEffect, useRef } from 'react'
import { asset, fine } from '../lib/env'
import type { Profile } from '../lib/roast'
import { gsap } from '../lib/scroll'
import { SplitHeading } from './Words'

interface Lot {
  profile: Profile
  img: string
  alt: string
  name: string
  sub: string
  roast: string
  notes: string
  altitude: string
  price: number
}

const LOTS: Lot[] = [
  { profile: 'clara', img: 'cherries-hand.webp', alt: 'Mão segurando cerejas vermelhas de café recém-colhidas', name: 'Mantiqueira', sub: 'Lote 014 · Sul de Minas · natural', roast: 'Torra clara', notes: 'damasco, mel, chá preto', altitude: '1.250 m', price: 52 },
  { profile: 'clara', img: 'harvest.webp', alt: 'Colhedora de café em meio aos cafeeiros', name: 'Microlote', sub: 'Lote 003 · Sul de Minas · natural fermentado', roast: 'Torra clara', notes: 'frutas vermelhas, vinho, cacau', altitude: '1.300 m', price: 68 },
  { profile: 'media', img: 'pourover.webp', alt: 'Café sendo coado em filtro de vidro, com vapor subindo da chaleira', name: 'Cerrado', sub: 'Lote 021 · Cerrado Mineiro · cereja descascada', roast: 'Torra média', notes: 'chocolate ao leite, avelã', altitude: '1.050 m', price: 46 },
  { profile: 'escura', img: 'scoop-beans.webp', alt: 'Concha despejando grãos de café torrados em um moedor', name: 'Casa', sub: 'Lote 009 · blend para espresso e leite', roast: 'Torra escura', notes: 'cacau amargo, especiarias', altitude: '900 a 1.100 m', price: 44 },
]

interface Props {
  /** Torra destacada (vem da curva ou do clube). */
  active: Profile | null
  onSee: (p: Profile) => void
}

/** Lista de lotes. Com mouse, a foto do lote segue o cursor. */
export function Lots({ active, onSee }: Props) {
  const peek = useRef<HTMLDivElement>(null)
  const img = useRef<HTMLImageElement>(null)
  const move = useRef<{ x: (v: number) => void; y: (v: number) => void } | null>(null)

  useLayoutEffect(() => {
    if (!fine || !peek.current) return
    const el = peek.current
    gsap.set(el, { xPercent: -50, yPercent: -50, scale: 0.6, opacity: 0 })
    move.current = {
      x: gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' }),
      y: gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' }),
    }
    return () => {
      gsap.killTweensOf(el)
      move.current = null
    }
  }, [])

  const enter = (src: string) => {
    if (!fine || !img.current || !peek.current) return
    img.current.src = asset(src)
    gsap.to(peek.current, { opacity: 1, scale: 1, duration: 0.45, ease: 'expo.out' })
  }
  const leave = () => fine && peek.current && gsap.to(peek.current, { opacity: 0, scale: 0.6, duration: 0.3 })

  return (
    <>
      <section className="lots" id="lotes" data-h="light">
        <div className="wrap">
          <div className="sec-head">
            <SplitHeading className="big" text="Lotes da semana" />
            <p>Origem, processo e ponto de torra definidos. “Ver curva” leva você ao ponto de saída daquele lote no gráfico.</p>
          </div>
          {LOTS.map((l) => (
            <article
              key={l.name}
              className={'lot' + (active === l.profile ? ' on' : '')}
              onMouseEnter={() => enter(l.img)}
              onMouseLeave={leave}
              onMouseMove={(e) => { move.current?.x(e.clientX + 60); move.current?.y(e.clientY) }}
            >
              <img className="th" src={asset(l.img)} alt={l.alt} loading="lazy" decoding="async" />
              <h3 className="nm">{l.name}<small>{l.sub}</small></h3>
              <div className="dt"><span>{l.roast}</span><span>{l.notes}</span><span>{l.altitude}</span></div>
              <div className="pr">R$ {l.price}<small>250 g</small></div>
              <button className="go" type="button" onClick={() => onSee(l.profile)}>Ver curva</button>
            </article>
          ))}
        </div>
      </section>
      <div id="peek" ref={peek} aria-hidden="true"><img ref={img} alt="" src={asset(LOTS[0].img)} /></div>
    </>
  )
}

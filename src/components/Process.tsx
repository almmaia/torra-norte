import { useLayoutEffect, useRef } from 'react'
import { asset } from '../lib/env'
import { gsap } from '../lib/scroll'

const STEPS = [
  { img: 'harvest.webp', alt: 'Colhedora de café entre os cafeeiros, com cesto na cintura', title: 'Colheita', text: 'Cerejas maduras, colhidas à mão por talhão. O ponto de maturação decide boa parte do sabor.' },
  { img: 'burlap-beans.webp', alt: 'Saco de juta cheio de grãos de café', title: 'Secagem', text: 'Terreiro ou lavagem, conforme o lote. A umidade precisa estabilizar antes de o café viajar.' },
  { img: 'roast-scoop.webp', alt: 'Pá de metal retirando amostra de grãos em torra', title: 'Torra', text: 'Lotes pequenos, curva registrada e prova de cor a cada minuto, como no gráfico lá em cima.' },
  { img: 'cooling-drum.webp', alt: 'Grãos recém-torrados esfriando no tambor de aço', title: 'Descanso', text: 'Depois da torra o grão libera gás. Esperamos alguns dias antes de embalar.' },
  { img: 'cupping.webp', alt: 'Pessoas provando café em xícaras brancas sobre uma mesa de aço', title: 'Prova', text: 'Todo lote passa por cupping antes de ir para o site. Só sai o que estiver no ponto.' },
]

/** Etapas em rolagem horizontal no desktop; empilhadas no celular. */
export function Process() {
  const sec = useRef<HTMLElement>(null)
  const pin = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 1000px)', () => {
      const dist = () => Math.max(0, track.current!.scrollWidth - innerWidth)
      gsap.to(track.current, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: sec.current, start: 'top top', end: () => '+=' + dist(), pin: pin.current,
          scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
        },
      })
    })
    return () => mm.revert()
  }, [])

  return (
    <section className="proc" id="processo" data-h="dark" ref={sec}>
      <div className="proc-pin" ref={pin}>
        <div className="proc-track" ref={track}>
          <div className="p-intro">
            <h2 className="big">Do pé à xícara</h2>
            <p>Cinco etapas, na ordem em que acontecem. A torra é a terceira, e é a que decide o sabor final.</p>
            <div className="arrow"><i />Role para o lado</div>
          </div>
          {STEPS.map((s) => (
            <article className="p-step" key={s.title}>
              <div className="im"><img src={asset(s.img)} alt={s.alt} loading="lazy" decoding="async" /></div>
              <div className="tx"><h3>{s.title}</h3><p>{s.text}</p></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

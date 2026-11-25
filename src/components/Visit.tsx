import { useRef } from 'react'
import { asset } from '../lib/env'
import { useParallax } from '../lib/useParallax'
import { SplitHeading } from './Words'

export function Visit() {
  const sec = useRef<HTMLElement>(null)
  useParallax(sec)
  return (
    <section className="visit" id="visita" data-h="light" ref={sec}>
      <div className="wrap">
        <div className="visit-grid">
          <div className="ph"><img src={asset('roaster-cafe.webp')} alt="Torrador de café de aço e vidro iluminado em uma cafeteria" loading="lazy" decoding="async" data-par="-8" /></div>
          <div>
            <SplitHeading className="big" text="Venha ver a torra acontecer" />
            <dl>
              <dt>Endereço</dt><dd>Rua Gonçalo de Carvalho, 240<br />Floresta, Porto Alegre, RS</dd>
              <dt>Horário</dt><dd>Ter a sáb, 8h às 18h<br />Torra aberta ao público às quintas, 9h</dd>
              <dt>Na loja</dt><dd>Café coado, espresso e os lotes da semana</dd>
            </dl>
            <a className="btn" href="#clube" data-mag>Quero receber em casa</a>
          </div>
        </div>
      </div>
    </section>
  )
}

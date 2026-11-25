import { useState } from 'react'
import { asset } from '../lib/env'
import type { Profile } from '../lib/roast'
import { SplitHeading } from './Words'

const PRICE: Record<Profile, number> = { clara: 52, media: 46, escura: 44 }
const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const ROASTS: { v: Profile; name: string; note: string }[] = [
  { v: 'clara', name: 'Clara', note: 'frutas e acidez' },
  { v: 'media', name: 'Média', note: 'chocolate e nozes' },
  { v: 'escura', name: 'Escura', note: 'cacau e especiarias' },
]
const GRINDS = [
  { v: 'em grãos', name: 'Em grãos' },
  { v: 'para filtro', name: 'Filtro' },
  { v: 'para espresso', name: 'Espresso' },
  { v: 'para prensa francesa', name: 'Prensa francesa' },
]
const FREQS = [
  { v: 1, name: 'Todo mês', note: '1 pacote de 250 g' },
  { v: 2, name: 'A cada 15 dias', note: '2 pacotes de 250 g' },
]

/** Montagem do clube: o valor mensal e a mensagem de WhatsApp acompanham as escolhas. */
export function Club({ onRoast }: { onRoast: (p: Profile) => void }) {
  const [roast, setRoast] = useState<Profile>('media')
  const [grind, setGrind] = useState('para filtro')
  const [freq, setFreq] = useState(2)

  const per = PRICE[roast] * 0.9
  const total = per * freq
  const msg = `Olá! Quero assinar o clube: torra ${roast}, ${grind}, ${freq} pacote(s) de 250 g por mês (${brl(total)}).`

  return (
    <section className="club" id="clube" data-h="dark">
      <div className="wrap">
        <div className="sec-head">
          <SplitHeading className="big" text="Monte o seu clube" />
          <p>Escolha a torra, a moagem e a frequência. O valor se atualiza na hora, com 10% de desconto sobre o preço avulso.</p>
        </div>
        <div className="club-grid">
          <div className="opts">
            <fieldset className="opt">
              <legend>Ponto de torra</legend>
              <div className="row">
                {ROASTS.map((o) => (
                  <button key={o.v} type="button" aria-pressed={roast === o.v} onClick={() => { setRoast(o.v); onRoast(o.v) }}>
                    <b>{o.name}</b><span>{o.note}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="opt">
              <legend>Moagem</legend>
              <div className="row">
                {GRINDS.map((o) => (
                  <button key={o.v} type="button" aria-pressed={grind === o.v} onClick={() => setGrind(o.v)}><b>{o.name}</b></button>
                ))}
              </div>
            </fieldset>
            <fieldset className="opt">
              <legend>Frequência</legend>
              <div className="row">
                {FREQS.map((o) => (
                  <button key={o.v} type="button" aria-pressed={freq === o.v} onClick={() => setFreq(o.v)}>
                    <b>{o.name}</b><span>{o.note}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            <ul className="incl">
              <li>Torra feita na semana do envio, com a data na embalagem</li>
              <li>Troque o ponto de torra ou a moagem quando quiser</li>
              <li>Pause ou cancele pelo WhatsApp, sem multa</li>
            </ul>
          </div>
          <aside className="ticket" aria-live="polite">
            <img className="tk-ph" src={asset('grinder-beans.webp')} alt="" loading="lazy" decoding="async" />
            <div className="tk-in">
              <h3>Seu clube</h3>
              <p className="sum">{freq} pacote{freq > 1 ? 's' : ''} de 250 g por mês, torra {roast}, {grind}.</p>
              <div className="total"><span>{brl(total)}</span><small>por mês</small></div>
              <p className="per">{brl(per)} por pacote · avulso {brl(PRICE[roast])}</p>
              <a className="btn sun" href={'https://wa.me/?text=' + encodeURIComponent(msg)} target="_blank" rel="noopener" data-mag>Assinar pelo WhatsApp</a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

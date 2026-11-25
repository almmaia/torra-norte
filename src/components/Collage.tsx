import { useRef } from 'react'
import { asset } from '../lib/env'
import { useParallax } from '../lib/useParallax'

/** Colagem de fotos com parallax e a frase de apoio. */
export function Collage() {
  const sec = useRef<HTMLElement>(null)
  useParallax(sec)
  return (
    <section className="collage" data-h="light" ref={sec}>
      <div className="wrap">
        <div className="cg">
          <figure className="a"><img src={asset('latte-hands.webp')} alt="Mãos segurando uma xícara com café com leite e desenho na espuma" loading="lazy" decoding="async" data-par="-9" /></figure>
          <div className="t">
            <h3>Do nosso torrador para a sua mesa.</h3>
            <p>Moinho de mão, coador de papel, espresso ou prensa francesa: o café sai da torra pensado para o seu método.</p>
          </div>
          <figure className="c"><img src={asset('grinder-vintage.webp')} alt="Moedor manual antigo de café diante de uma parede verde-petróleo" loading="lazy" decoding="async" data-par="-12" /></figure>
          <figure className="b"><img src={asset('cafe-dark.webp')} alt="Balcão de uma cafeteria com luminárias quentes e prateleiras" loading="lazy" decoding="async" data-par="-8" /></figure>
        </div>
      </div>
    </section>
  )
}

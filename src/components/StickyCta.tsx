/** Botão fixo no rodapé do celular, visível entre a frase de destaque e o clube. */
export function StickyCta({ on }: { on: boolean }) {
  return (
    <a className={'sticky-cta btn sun' + (on ? ' on' : '')} id="sticky" href="#clube" aria-label="Montar meu clube de assinatura">
      Montar meu clube
    </a>
  )
}

/** Rodapé: chamada para o clube, navegação, endereço, atendimento e o nome da marca em tamanho grande. */
export function Footer() {
  return (
    <footer data-h="dark">
      <div className="wrap">
        <div className="f-top">
          <h2 className="f-cta">Café fresco, torrado esta semana.</h2>
          <a className="btn sun" href="#clube" data-mag>Montar meu clube</a>
        </div>
        <div className="f-cols">
          <div className="f-brand">
            <a className="brand" href="#hero" aria-label="Torra Norte, início">
              <svg viewBox="0 0 32 32" aria-hidden="true">
                <ellipse cx="16" cy="16" rx="9.5" ry="13" transform="rotate(25 16 16)" fill="currentColor" />
                <path d="M12 5.5C17 11 13 21 20 26.5" fill="none" stroke="#120D09" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
              Torra Norte
            </a>
            <p>Torrefação de café especial em Porto Alegre. Lotes pequenos, curva registrada e envio com a data da torra na embalagem.</p>
          </div>
          <nav aria-label="Rodapé">
            <h3>Navegue</h3>
            <ul>
              <li><a href="#curva">A curva de torra</a></li>
              <li><a href="#lotes">Lotes da semana</a></li>
              <li><a href="#processo">Do pé à xícara</a></li>
              <li><a href="#clube">Clube de assinatura</a></li>
            </ul>
          </nav>
          <div>
            <h3>Visite a torra</h3>
            <p>Rua Gonçalo de Carvalho, 240<br />Floresta, Porto Alegre, RS</p>
            <p>Ter a sáb, 8h às 18h<br />Torra aberta ao público às quintas, 9h</p>
          </div>
          <div>
            <h3>Atendimento</h3>
            <p>Pedidos, assinaturas e dúvidas de terça a sábado.</p>
            <a className="btn sun" href="https://wa.me/" target="_blank" rel="noopener">Chamar no WhatsApp</a>
          </div>
        </div>
        <div className="f-base">
          <span>© 2026 Torra Norte Torrefação. Todos os direitos reservados.</span>
          <a href="#hero">Voltar ao topo</a>
        </div>
      </div>
      <div className="giant" aria-hidden="true">TORRA NORTE</div>
    </footer>
  )
}

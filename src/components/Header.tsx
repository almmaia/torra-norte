/** Barra superior fixa. O tema (claro/escuro) acompanha a seção que está embaixo dela. */
export function Header({ theme }: { theme: 'dark' | 'light' }) {
  return (
    <header className="top" data-t={theme} id="top">
      <div className="wrap">
        <a className="brand" href="#hero" aria-label="Torra Norte, início">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <ellipse cx="16" cy="16" rx="9.5" ry="13" transform="rotate(25 16 16)" fill="currentColor" />
            <path d="M12 5.5C17 11 13 21 20 26.5" fill="none" stroke="#120D09" strokeWidth="2.4" strokeLinecap="round" className="crease" />
          </svg>
          Torra Norte
        </a>
        <nav className="nav" aria-label="Principal">
          <a className="hide-sm" href="#curva">A curva</a>
          <a className="hide-sm" href="#lotes">Lotes</a>
          <a className="hide-sm" href="#processo">Processo</a>
          <a className="hide-sm" href="#visita">Visite</a>
          <a className="btn" href="#clube" data-mag>Assinar</a>
        </nav>
      </div>
    </header>
  )
}

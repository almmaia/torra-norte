import { useCallback, useEffect, useState } from 'react'
import { Collage } from './components/Collage'
import { Club } from './components/Club'
import { Cursor } from './components/Cursor'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Lots } from './components/Lots'
import { Marquee } from './components/Marquee'
import { Preloader } from './components/Preloader'
import { Process } from './components/Process'
import { RoastCurve } from './components/RoastCurve'
import { ScrollBeans } from './components/ScrollBeans'
import { Statement } from './components/Statement'
import { StickyCta } from './components/StickyCta'
import { Visit } from './components/Visit'
import { fine, reduce } from './lib/env'
import type { Profile } from './lib/roast'
import { jumpToProfile } from './lib/roastPin'
import { goTo, gsap, ScrollTrigger, startScroll } from './lib/scroll'

export default function App() {
  const [go, setGo] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [sticky, setSticky] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const onFinish = useCallback(() => setGo(true), [])

  // Tudo que depende de a página inteira existir (roda depois dos filhos, que criam as seções fixas).
  useEffect(() => {
    // o texto do topo fica oculto até a fonte carregar, para o layout não pular
    const root = document.documentElement
    const fontsOk = () => root.classList.add('fonts-ok')
    document.fonts?.ready.then(fontsOk)
    const fontsTimer = window.setTimeout(fontsOk, 1800)

    const stopScroll = startScroll()

    // âncoras com rolagem suave
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]')
      const id = a?.getAttribute('href')
      if (!a || !id || id.length < 2) return
      if (goTo(id)) e.preventDefault()
    }
    document.addEventListener('click', onClick)

    // tema da barra superior: segue a seção que está logo abaixo dela (verificado a cada ~100 ms, sem depender de eventos)
    let lastCheck = 0
    const themeTick = (time: number) => {
      if (time - lastCheck < 0.1) return
      lastCheck = time
      const el = document.elementsFromPoint(innerWidth / 2, 57).map((e) => e.closest<HTMLElement>('[data-h]')).find(Boolean)
      if (el) setTheme(el.dataset.h === 'light' ? 'light' : 'dark')
    }
    gsap.ticker.add(themeTick)
    const triggers: ScrollTrigger[] = []
    // botão fixo do celular
    triggers.push(
      ScrollTrigger.create({
        trigger: '.statement', start: 'top 80%', endTrigger: '#clube', end: 'top 70%',
        onToggle: (s) => setSticky(s.isActive),
      }),
    )

    // botões magnéticos (só com mouse)
    const magnets: (() => void)[] = []
    if (fine && !reduce) {
      gsap.utils.toArray<HTMLElement>('[data-mag]').forEach((b) => {
        const mx = gsap.quickTo(b, 'x', { duration: 0.4, ease: 'power3' })
        const my = gsap.quickTo(b, 'y', { duration: 0.4, ease: 'power3' })
        const move = (e: MouseEvent) => {
          const r = b.getBoundingClientRect()
          mx((e.clientX - r.left - r.width / 2) * 0.28)
          my((e.clientY - r.top - r.height / 2) * 0.4)
        }
        const leave = () => { mx(0); my(0) }
        b.addEventListener('mousemove', move)
        b.addEventListener('mouseleave', leave)
        magnets.push(() => { b.removeEventListener('mousemove', move); b.removeEventListener('mouseleave', leave) })
      })
    }

    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    document.fonts?.ready.then(refresh)
    ScrollTrigger.sort()

    return () => {
      clearTimeout(fontsTimer)
      gsap.ticker.remove(themeTick)
      document.removeEventListener('click', onClick)
      window.removeEventListener('load', refresh)
      triggers.forEach((t) => t.kill())
      magnets.forEach((off) => off())
      stopScroll()
    }
  }, [])

  const onSee = (p: Profile) => {
    setProfile(p)
    jumpToProfile(p)
  }

  return (
    <>
      <Preloader onFinish={onFinish} />
      <Cursor />
      <ScrollBeans />
      <Header theme={theme} />
      <main>
        <Hero go={go} />
        <Marquee />
        <RoastCurve />
        <Statement />
        <Lots active={profile} onSee={onSee} />
        <Process />
        <Collage />
        <Club onRoast={setProfile} />
        <Visit />
      </main>
      <Footer />
      <StickyCta on={sticky} />
    </>
  )
}

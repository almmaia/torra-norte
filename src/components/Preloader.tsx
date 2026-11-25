import { useEffect, useRef, useState } from 'react'
import { reduce } from '../lib/env'
import { gsap } from '../lib/scroll'

/** Tela de abertura com contador. Chama onFinish quando a página está pronta para a entrada. */
export function Preloader({ onFinish }: { onFinish: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLElement>(null)
  const num = useRef<HTMLSpanElement>(null)
  const [gone, setGone] = useState(reduce)

  useEffect(() => {
    if (reduce) {
      onFinish()
      return
    }
    const el = root.current
    let done = false
    let timer = 0
    const finish = () => {
      if (done) return
      done = true
      onFinish()
      gsap.to(root.current, { yPercent: -100, duration: 0.9, ease: 'expo.inOut', onComplete: () => setGone(true) })
    }
    const o = { v: 0 }
    const tw = gsap.to(o, {
      v: 100, duration: 1.3, ease: 'power2.inOut',
      onUpdate: () => {
        if (num.current) num.current.textContent = String(Math.round(o.v))
        if (bar.current) bar.current.style.transform = `scaleX(${o.v / 100})`
      },
      onComplete: () => {
        if (document.readyState === 'complete') finish()
        else window.addEventListener('load', finish, { once: true })
        timer = window.setTimeout(finish, 2500)
      },
    })
    return () => {
      tw.kill()
      clearTimeout(timer)
      window.removeEventListener('load', finish)
      gsap.killTweensOf(el)
    }
    // onFinish é estável (useCallback no App)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (gone) return null
  return (
    <div id="pre" ref={root} aria-hidden="true">
      <div className="in">
        <svg viewBox="0 0 32 32"><ellipse cx="16" cy="16" rx="9.5" ry="13" transform="rotate(25 16 16)" fill="#ECEEE3" /><path d="M12 5.5C17 11 13 21 20 26.5" fill="none" stroke="#120D09" strokeWidth="2.4" strokeLinecap="round" /></svg>
        <div className="bar"><i ref={bar} /></div>
        <div className="num">Torrando <span ref={num}>0</span>%</div>
      </div>
    </div>
  )
}

import { useEffect, useRef } from 'react'
import { createScrollBeans } from '../lib/scrollBeans'

/** Camada fixa, sem clique, com grãos que pulam e giram conforme a rolagem. */
export function ScrollBeans() {
  const cv = useRef<HTMLCanvasElement>(null)
  useEffect(() => (cv.current ? createScrollBeans(cv.current) : undefined), [])
  return <canvas className="play" ref={cv} aria-hidden="true" />
}

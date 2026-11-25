const mq = (q: string) => typeof matchMedia !== 'undefined' && matchMedia(q).matches

/** Preferência do sistema por menos movimento. */
export const reduce = mq('(prefers-reduced-motion: reduce)')
/** Mouse de verdade (não toque): liga cursor, botões magnéticos e foto que segue o mouse. */
export const fine = mq('(hover: hover) and (pointer: fine)')

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
export const smooth = (a: number, b: number, v: number) => {
  const u = clamp((v - a) / (b - a), 0, 1)
  return u * u * (3 - 2 * u)
}

/** Caminho de uma imagem em /public/assets/images, respeitando a base do build. */
export const asset = (name: string) => `${import.meta.env.BASE_URL}assets/images/${name}`

/** Posição do mouse normalizada (-1 a 1), compartilhada pelas cenas 3D. */
export const mouse = { x: 0, y: 0, tx: 0, ty: 0 }
let mouseBound = false
export function bindMouse() {
  if (mouseBound || typeof window === 'undefined') return
  mouseBound = true
  window.addEventListener(
    'pointermove',
    (e) => {
      mouse.tx = (e.clientX / innerWidth) * 2 - 1
      mouse.ty = (e.clientY / innerHeight) * 2 - 1
    },
    { passive: true },
  )
}

import * as THREE from 'three'
import { beanGeo, beanMat, beanWithMorph, disposeAll, makeEnv, makeRenderer, noiseTex } from './bean'
import { bindMouse, mouse, reduce } from './env'
import { gsap, ScrollTrigger } from './scroll'

export interface HeroScene {
  /** Estado animado de fora: abertura (0→1) e progresso do scroll. */
  st: { scroll: number; intro: number }
  dispose: () => void
}

/** Cena do topo: o grão grande gira com o mouse e o scroll; grãos pequenos flutuam ao redor. */
export function createHero(canvas: HTMLCanvasElement, trigger: HTMLElement): HeroScene | null {
  const r = makeRenderer(canvas)
  if (!r) return null
  bindMouse()
  const scene = new THREE.Scene()
  scene.environment = makeEnv(r)
  const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 60)
  cam.position.set(0, 0, 9)
  const key = new THREE.DirectionalLight(0xffdfae, 2.4)
  key.position.set(-3, 4, 6)
  scene.add(key)
  const rim = new THREE.PointLight(0x5568ff, 80, 22)
  rim.position.set(5, -1, -3)
  scene.add(rim)

  const bump = noiseTex()
  const hm = beanMat(0x4a2815, bump)
  hm.roughness = 0.34
  hm.clearcoat = 0.7
  const main = new THREE.Mesh(beanWithMorph(104, 78), hm)
  main.morphTargetInfluences![0] = 0.55
  const pivot = new THREE.Group()
  pivot.add(main)
  scene.add(pivot)

  const N = innerWidth < 760 ? 16 : 38
  const inst = new THREE.InstancedMesh(
    beanGeo(26, 20, { s: 1, w: 0.085, d: 0.1 }),
    new THREE.MeshStandardMaterial({ roughness: 0.42, metalness: 0, envMapIntensity: 1.2 }),
    N,
  )
  const shades = [0x3a2013, 0x5a3319, 0x7a4a26, 0x2a150e, 0x8a5a2c]
  const col = new THREE.Color()
  const items: { x: number; y: number; z: number; s: number; rx: number; ry: number; vx: number; vy: number; ph: number }[] = []
  for (let i = 0; i < N; i++) {
    let x: number, y: number, z: number
    do {
      x = (Math.random() * 2 - 1) * 7.5
      y = (Math.random() * 2 - 1) * 4.2
      z = -5 + Math.random() * 8.5
    } while ((Math.abs(x) < 2.2 && Math.abs(y) < 2.4 && z > -1.5) || (y < -0.4 && Math.abs(x) > 1.2))
    items.push({ x, y, z, s: 0.12 + Math.random() * 0.26, rx: Math.random() * 6, ry: Math.random() * 6, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, ph: Math.random() * 6 })
    inst.setColorAt(i, col.setHex(shades[i % shades.length]))
  }
  scene.add(inst)

  const dummy = new THREE.Object3D()
  const st = { scroll: 0, intro: reduce ? 1 : 0 }
  let base = 1.12
  let portrait = false
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight
    if (!w || !h) return
    r.setSize(w, h, false)
    cam.aspect = w / h
    portrait = w / h < 0.9
    cam.position.z = portrait ? 11.5 : 9
    cam.updateProjectionMatrix()
    base = portrait ? 1.05 : 1.12
  }
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  resize()

  let live = true
  let T = 0
  const tick = (_t: number, dtMs: number) => {
    if (!live) return
    T += dtMs / 1000
    mouse.x += (mouse.tx - mouse.x) * 0.05
    mouse.y += (mouse.ty - mouse.y) * 0.05
    pivot.scale.setScalar(base * (0.55 + 0.45 * st.intro) * (1 + st.scroll * 0.55))
    pivot.rotation.set(
      0.18 + mouse.y * 0.3 + st.scroll * 0.6,
      Math.sin(T * 0.5) * 0.65 + mouse.x * 0.6 + st.scroll * 3.2 - (1 - st.intro) * 3,
      -0.62 + st.scroll * 0.8,
    )
    pivot.position.y = (portrait ? 0.9 : 0.15) - st.scroll * 2.4 + Math.sin(T * 0.8) * 0.08
    for (let i = 0; i < N; i++) {
      const it = items[i], par = (it.z + 5) / 8.5
      dummy.position.set(
        it.x + mouse.x * (0.2 + par * 0.7) + Math.sin(T * 0.3 + it.ph) * it.vx,
        it.y - mouse.y * (0.15 + par * 0.5) + Math.sin(T * 0.4 + it.ph) * it.vy - st.scroll * (1 + par * 3),
        it.z,
      )
      dummy.rotation.set(it.rx + T * 0.25 * it.vx * 2, it.ry + T * 0.3, 0)
      dummy.scale.setScalar(it.s * (0.4 + 0.6 * st.intro))
      dummy.updateMatrix()
      inst.setMatrixAt(i, dummy.matrix)
    }
    inst.instanceMatrix.needsUpdate = true
    r.render(scene, cam)
  }
  gsap.ticker.add(tick)

  const trig = ScrollTrigger.create({
    trigger, start: 'top top', end: 'bottom top', scrub: true,
    onUpdate: (s) => { st.scroll = s.progress },
    onToggle: (s) => { live = s.isActive },
  })

  return {
    st,
    dispose() {
      gsap.ticker.remove(tick)
      trig.kill()
      ro.disconnect()
      bump.dispose()
      disposeAll(scene, r)
    },
  }
}

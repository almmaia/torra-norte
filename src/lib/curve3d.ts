import * as THREE from 'three'
import { beanMat, beanWithMorph, disposeAll, makeEnv, makeRenderer, noiseTex } from './bean'
import { smooth } from './env'
import { colorAt, tempAt } from './roast'

export interface CurveGL {
  /** Desenha o grão no minuto t da torra. */
  render: (t: number) => void
  /** Pede um novo desenho mesmo que t não tenha mudado (ex.: redimensionou). */
  consumeDirty: () => boolean
  dispose: () => void
}

/** Grão do instrumento: muda de cor, brilho e tamanho conforme a temperatura; treme no primeiro crack. */
export function createCurveGL(canvas: HTMLCanvasElement): CurveGL | null {
  const r = makeRenderer(canvas)
  if (!r) return null
  const scene = new THREE.Scene()
  scene.environment = makeEnv(r)
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 40)
  cam.position.set(0, 0, 7.2)
  const key = new THREE.DirectionalLight(0xffe8c4, 2.6)
  key.position.set(-3, 3, 5)
  scene.add(key)
  const rim = new THREE.PointLight(0xffffff, 60, 20)
  rim.position.set(4, 2, -3)
  scene.add(rim)

  const bump = noiseTex()
  const mat = beanMat(0x7c8f4e, bump)
  const bean = new THREE.Mesh(beanWithMorph(104, 78), mat)
  const pivot = new THREE.Group()
  pivot.add(bean)
  scene.add(pivot)

  let dirty = true
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight
    if (!w || !h) return
    r.setSize(w, h, false)
    cam.aspect = w / h
    cam.position.z = w / h < 0.9 ? 8.6 : 7.2
    cam.updateProjectionMatrix()
    dirty = true
  }
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  resize()

  return {
    render(t) {
      const T = tempAt(t), rgb = colorAt(T)
      mat.color.setRGB(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, THREE.SRGBColorSpace)
      const dark = smooth(196, 226, T)
      mat.roughness = 0.62 - dark * 0.34
      mat.clearcoat = 0.1 + dark * 0.7
      mat.bumpScale = 0.9 - dark * 0.3
      bean.morphTargetInfluences![0] = smooth(190, 216, T) * 0.85 + smooth(9.0, 10.2, t) * 0.15
      const fc = Math.max(0, 1 - Math.abs(t - 9.7) / 0.45)
      const shake = fc * 0.05 * Math.sin(t * 140)
      pivot.scale.setScalar((0.86 + smooth(90, 225, T) * 0.14 + fc * 0.05) * 1.25)
      pivot.rotation.set(0.15 + shake, Math.sin(t * 0.55) * 0.6 + 0.15, -0.55 + shake * 0.6)
      r.render(scene, cam)
    },
    consumeDirty() {
      const d = dirty
      dirty = false
      return d
    },
    dispose() {
      ro.disconnect()
      bump.dispose()
      disposeAll(scene, r)
    },
  }
}

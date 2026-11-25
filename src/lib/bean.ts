import * as THREE from 'three'

/** Funde as normais de vértices coincidentes (a emenda da esfera some). */
function smoothNormals(g: THREE.BufferGeometry) {
  const pos = g.attributes.position as THREE.BufferAttribute
  const nor = g.attributes.normal as THREE.BufferAttribute
  const map = new Map<string, { n: [number, number, number]; idx: number[] }>()
  for (let i = 0; i < pos.count; i++) {
    const k = pos.getX(i).toFixed(4) + '|' + pos.getY(i).toFixed(4) + '|' + pos.getZ(i).toFixed(4)
    let e = map.get(k)
    if (!e) { e = { n: [0, 0, 0], idx: [] }; map.set(k, e) }
    e.n[0] += nor.getX(i); e.n[1] += nor.getY(i); e.n[2] += nor.getZ(i); e.idx.push(i)
  }
  map.forEach((e) => {
    const l = Math.hypot(e.n[0], e.n[1], e.n[2]) || 1
    e.idx.forEach((i) => nor.setXYZ(i, e.n[0] / l, e.n[1] / l, e.n[2] / l))
  })
}

interface BeanParams { s: number; w: number; d: number }

/** Grão de café: elipsoide achatado de um lado, com o sulco central e um leve arco. */
export function beanGeo(sw: number, sh: number, p: BeanParams) {
  const g = new THREE.SphereGeometry(1, sw, sh)
  const pos = g.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
    let X = x * 0.72 * p.s
    const Y = y * p.s
    let Z = (z > 0 ? z * 0.4 : z * 0.56) * p.s
    X += 0.07 * y * y * p.s
    if (z > 0) {
      const cx = 0.03 * Math.sin(y * 2.2), dx = x * 0.72 - cx
      const along = Math.pow(Math.max(0, 1 - y * y), 0.6), gate = Math.min(1, z * 4)
      Z -= p.d * Math.exp(-(dx * dx) / (p.w * p.w)) * along * gate
      const lip = Math.exp(-Math.pow((Math.abs(dx) - p.w * 1.5) / (p.w * 0.5), 2))
      Z += 0.028 * lip * along * gate
    }
    pos.setXYZ(i, X, Y, Z)
  }
  g.computeVertexNormals()
  smoothNormals(g)
  return g
}

/** Grão com um morph target: o sulco abre e o grão cresce durante a torra. */
export function beanWithMorph(sw: number, sh: number) {
  const a = beanGeo(sw, sh, { s: 1, w: 0.09, d: 0.15 })
  const b = beanGeo(sw, sh, { s: 1.14, w: 0.13, d: 0.27 })
  a.morphAttributes.position = [b.attributes.position as THREE.BufferAttribute]
  a.morphAttributes.normal = [b.attributes.normal as THREE.BufferAttribute]
  return a
}

/** Textura de ruído usada como relevo da casca. */
export function noiseTex() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const x = c.getContext('2d')!
  const im = x.createImageData(64, 64)
  for (let i = 0; i < im.data.length; i += 4) {
    const v = 90 + Math.random() * 120
    im.data[i] = im.data[i + 1] = im.data[i + 2] = v
    im.data[i + 3] = 255
  }
  const t = document.createElement('canvas')
  t.width = t.height = 64
  t.getContext('2d')!.putImageData(im, 0, 0)
  x.imageSmoothingEnabled = true
  x.drawImage(t, 0, 0, 256, 256)
  x.globalAlpha = 0.5
  x.drawImage(t, 0, 0, 96, 96)
  x.drawImage(c, 0, 0, 256, 256)
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2, 2)
  return tex
}

type RGB = [number, number, number]

/** Estúdio de luz: softbox no alto, faixa quente à esquerda e faixa cobalto à direita. */
export function makeEnv(renderer: THREE.WebGLRenderer) {
  const s = new THREE.Scene()
  s.add(new THREE.Mesh(new THREE.BoxGeometry(30, 20, 30), new THREE.MeshBasicMaterial({ color: 0x0b0705, side: THREE.BackSide })))
  const panel = (w: number, h: number, pos: RGB, rgb: RGB, rot: RGB) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }))
    m.material.color.setRGB(rgb[0], rgb[1], rgb[2])
    m.position.set(pos[0], pos[1], pos[2])
    m.rotation.set(rot[0], rot[1], rot[2])
    s.add(m)
  }
  panel(14, 8, [0, 9, 2], [7, 6.6, 6], [Math.PI / 2, 0, 0])
  panel(3, 12, [-11, 0, 4], [6, 3.9, 1.2], [0, Math.PI / 2, 0])
  panel(3, 12, [11, 0, -3], [0.9, 1.3, 7], [0, -Math.PI / 2, 0])
  panel(10, 3, [0, -8, 6], [1.2, 0.9, 0.7], [-Math.PI / 2, 0, 0])
  const pm = new THREE.PMREMGenerator(renderer)
  const tex = pm.fromScene(s, 0.02).texture
  pm.dispose()
  s.traverse((o) => {
    const m = o as THREE.Mesh
    if (m.geometry) m.geometry.dispose()
    if (m.material) (m.material as THREE.Material).dispose()
  })
  return tex
}

/** Renderer com resolução limitada (economia de GPU). Devolve null se o WebGL falhar. */
export function makeRenderer(canvas: HTMLCanvasElement) {
  try {
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    r.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 760 ? 1.25 : 1.5))
    r.toneMapping = THREE.ACESFilmicToneMapping
    r.toneMappingExposure = 1.1
    return r
  } catch {
    return null
  }
}

export function beanMat(c: number, bump: THREE.Texture) {
  return new THREE.MeshPhysicalMaterial({
    color: c, roughness: 0.5, metalness: 0, clearcoat: 0.25, clearcoatRoughness: 0.35,
    bumpMap: bump, bumpScale: 0.7, envMapIntensity: 1.25,
  })
}

/** Libera geometrias, materiais, texturas e o contexto WebGL. */
export function disposeAll(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
  scene.traverse((o) => {
    const m = o as THREE.Mesh
    if (m.geometry) m.geometry.dispose()
    const mat = m.material as THREE.Material | THREE.Material[] | undefined
    if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
    else mat?.dispose()
  })
  if (scene.environment) scene.environment.dispose()
  renderer.dispose()
}

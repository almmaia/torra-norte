/** Dados e matemática da curva de torra: temperatura do grão por minuto. */
export type Profile = 'clara' | 'media' | 'escura'

export const MAXT = 14.5
export const YMIN = 80
export const YMAX = 240

/** Minuto de saída de cada ponto de torra. */
export const PROF: Record<Profile, number> = { clara: 10.5, media: 12, escura: 13.5 }

const PTS: [number, number][] = [
  [0, 195], [0.6, 128], [1.3, 92], [2, 108], [3, 126], [4, 141], [5, 154], [6, 166],
  [7, 177], [8, 187], [9, 196], [10, 203], [11, 209], [12, 215], [13, 220], [14, 225], [14.5, 228],
]

export const STAGES = [
  { to: 1.3, n: 'Carga e ponto de virada', t: 'O grão verde cai no tambor quente e esfria o metal. A temperatura mínima marca o ponto de virada.' },
  { to: 4.7, n: 'Secagem', t: 'O grão perde umidade e passa de verde a amarelo. Cheiro de grama e feno.' },
  { to: 9.2, n: 'Reação de Maillard', t: 'O grão dora. Aparecem aromas de pão tostado e caramelo, e a acidez se transforma.' },
  { to: 10.2, n: 'Primeiro crack', t: 'O grão estala e dobra de volume. É aqui que nascem as frutas e a acidez brilhante.' },
  { to: 13.2, n: 'Desenvolvimento', t: 'A doçura se firma. Mel, chocolate e nozes ganham corpo, e a acidez abaixa.' },
  { to: 99, n: 'Segundo crack', t: 'Os óleos chegam à superfície. Notas defumadas e amargor de cacau passam a dominar.' },
]

/** Faixas de estágio desenhadas atrás da curva. */
export const BOUNDS = [0, 1.3, 4.7, 9.2, 10.2, 13.2, MAXT]
export const BOUND_NAMES = ['', 'Secagem', 'Maillard', '1º crack', 'Desenvolvimento', '2º crack']

const COLORS: [number, string][] = [
  [90, '#7C8F4E'], [125, '#A9AB58'], [145, '#C9B25A'], [165, '#C39A4C'], [180, '#A9703B'],
  [196, '#7E4A27'], [205, '#62371F'], [215, '#44251A'], [228, '#2A150E'],
]

/** Curva suavizada (Catmull-Rom), amostrada densamente. */
export const dense: [number, number][] = []
for (let i = 0; i < PTS.length - 1; i++) {
  const p0 = PTS[Math.max(0, i - 1)], p1 = PTS[i], p2 = PTS[i + 1], p3 = PTS[Math.min(PTS.length - 1, i + 2)]
  for (let k = 0; k < 24; k++) {
    const u = k / 24, u2 = u * u, u3 = u2 * u
    const f = (a: number, b: number, c: number, d: number) =>
      0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3)
    dense.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])])
  }
}
dense.push(PTS[PTS.length - 1])

export function tempAt(t: number) {
  if (t <= dense[0][0]) return dense[0][1]
  for (let i = 1; i < dense.length; i++) {
    if (dense[i][0] >= t) {
      const [x0, y0] = dense[i - 1], [x1, y1] = dense[i]
      return y0 + (y1 - y0) * ((t - x0) / (x1 - x0 || 1))
    }
  }
  return dense[dense.length - 1][1]
}

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))

/** Cor do grão (RGB 0–255) para uma temperatura. */
export function colorAt(T: number) {
  if (T <= COLORS[0][0]) return hex(COLORS[0][1])
  for (let i = 1; i < COLORS.length; i++) {
    if (T <= COLORS[i][0]) {
      const [t0, c0] = COLORS[i - 1], [t1, c1] = COLORS[i]
      const u = (T - t0) / (t1 - t0), a = hex(c0), b = hex(c1)
      return a.map((v, k) => Math.round(v + (b[k] - v) * u))
    }
  }
  return hex(COLORS[COLORS.length - 1][1])
}

export const fmt = (m: number) => {
  const s = Math.round(m * 60)
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0')
}

export const stageAt = (t: number) => STAGES.find((s) => t <= s.to) ?? STAGES[STAGES.length - 1]

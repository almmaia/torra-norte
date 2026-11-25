import { goY, type ScrollTriggerType as ST } from './scroll'
import { MAXT, PROF, type Profile } from './roast'

/** O ScrollTrigger que prende a seção da curva; usado para saltar ao ponto de saída de cada torra. */
export const roastPin: { st: ST | null } = { st: null }

export function jumpToProfile(p: Profile) {
  const st = roastPin.st
  if (!st) return
  goY(st.start + (PROF[p] / MAXT) * (st.end - st.start), 2.2)
}

import { Apply } from './Apply'
import { Kind, URIS } from 'fp-ts/HKT'

export interface Chain<F extends URIS> extends Apply<F> {
  readonly chain: <A, B>(f: (a: A) => Kind<F, B>) => (fa: Kind<F, A>) => Kind<F, B>
}

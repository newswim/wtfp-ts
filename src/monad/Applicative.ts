import { Apply } from './Apply'
import { URIS, Kind } from 'fp-ts/HKT'

export interface Applicative<F extends URIS> extends Apply<F> {
  readonly of: <A>(a: A) => Kind<F, A>
}

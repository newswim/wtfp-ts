import { Functor } from './Functor'
import { URIS, Kind } from 'fp-ts/HKT'

export interface Apply<F extends URIS> extends Functor<F> {
  readonly ap: <A, B>(
    fab: Kind<F, (a: A) => B>
  ) => (fa: Kind<F, A>) => Kind<F, B>
}

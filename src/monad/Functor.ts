import { Kind, URIS, HKT } from 'fp-ts/HKT'

export interface Functor<F extends URIS> {
  readonly URI: F
  // the "Kind" notation here is important because HKT needs to resolve ?? reasons unknown ??
  readonly map: <A, B>(f: (a: A) => B) => (fa: Kind<F, A>) => Kind<F, B>
}

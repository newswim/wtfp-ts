import { Kind, URIS } from 'fp-ts/HKT'

// the "Kind" notation here is important because HKT needs to resolve ?? reasons unknown ??

export interface Functor<F extends URIS> {
  readonly URI: F
  readonly map: <A, B>(f: (a: A) => B) => (fa: Kind<F, A>) => Kind<F, B>
}

/*
         Compare the type signature in Haskell...

class Functor f where
  fmap :: (a -> b) -> f a -> f b

*/

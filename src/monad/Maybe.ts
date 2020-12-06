import { Functor } from './Functor'
import { pipe } from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { Apply } from './Apply'
import { Applicative } from './Applicative'
import { Chain } from './Chain'
import { Monad } from './Monad'

const URI = 'Maybe'
type URI = typeof URI

// FP-TS secret sauce
declare module 'fp-ts/HKT' {
  interface URItoKind<A> {
    readonly [URI]: Maybe<A>
  }
}

// Type constructors
interface Nothing {
  _tag: 'Nothing'
}

interface Just<A> {
  _tag: 'Just'
  a: A
}

type Maybe<A> = Nothing | Just<A>

// Data constructors
const nothing = { _tag: 'Nothing' } as Maybe<never>

const just = <A>(a: A): Maybe<A> => ({ _tag: 'Just', a })

// Guards
const isNothing = <A>(ma: Maybe<A>): ma is Maybe<never> => ma._tag === 'Nothing'

const isJust = <A>(ma: Maybe<A>): ma is Just<A> => ma._tag === 'Just'

// @map for Maybe
const map: <A, B>(f: (a: A) => B) => (fa: Maybe<A>) => Maybe<B> = f => fa => {
  if (isNothing(fa)) {
    return nothing
  }

  const b = just(f(fa.a))

  return b
}

// Functor instance
const maybeF: Functor<URI> = {
  URI,
  map,
}

// Apply.ap instance
const ap: Apply<URI>['ap'] = fab => fa => {
  if (isNothing(fa)) {
    return nothing
  }

  // How is this different from say, pattern matching?
  const a = fa.a

  return pipe(
    fab,
    maybeF.map(ab => ab(a))
  )
}

// Applicative.of instance
const of: Applicative<URI>['of'] = just // that was easy

// Chain.chain instance
const chain: Chain<URI>['chain'] = afb => fa => {
  if (isNothing(fa)) {
    return nothing
  }

  const a = fa.a

  return afb(a)
}

// Monad instance
const maybeMonad: Monad<URI> = {
  URI,
  map,
  ap,
  of, // return, pure
  chain, // bind, flatMap
}

//// Utilities

const flatten = <A>(ma: Maybe<Maybe<A>>) =>
  pipe(
    ma,
    maybeMonad.chain(x => x)
  )

//// Examples

const ex1 = pipe(
  nothing,
  maybeF.map(n => n + 1)
)

const ex2 = pipe(
  O.none,
  O.map(n => n + 1)
)

const ex3 = pipe(
  just(1),
  just,
  just,
  maybeF.map(maybeF.map(maybeF.map(n => n + 1)))
)

const ex4 = pipe(
  just(1),
  just,
  just,
  maybeF.map(maybeF.map(maybeF.map(n => n + 1)))
)

const ex5 = pipe(
  just(1),
  maybeMonad.chain(n => maybeMonad.of(n + 1))
)

const ex6 = pipe(just(1), ap(just((n: number) => n + 1)))

const ex7 = pipe(just(1), maybeMonad.of, flatten)

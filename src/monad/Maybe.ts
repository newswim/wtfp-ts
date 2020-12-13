import { Functor } from './Functor'
import { pipe, Lazy, Predicate } from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { Apply } from './Apply'
import { Applicative } from './Applicative'
import { Chain } from './Chain'
import { Monad } from './Monad'
import { Eq } from 'fp-ts/lib/Eq'

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

const isNothing = <A>(ma: Maybe<A>): ma is Nothing => ma._tag === 'Nothing'

const isJust = <A>(ma: Maybe<A>): ma is Just<A> => ma._tag === 'Just'

// Maybe.map
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

// Maybe.ap instance

const ap: Apply<URI>['ap'] = fab => fa => {
  if (isNothing(fa) || isNothing(fab)) {
    return nothing
  }

  // How is this different from say, pattern matching?
  const a = fa.a
  const ab = fab.a

  return just(ab(a))
}

// Maybe.of instance

const of: Applicative<URI>['of'] = just // that was easy

// Maybe.chain instance

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

const _ = maybeMonad

const id = <A>(a: A) => a

/**
 * The `flatten` function, called "join" in Haskell
 */
const flatten = <A>(ma: Maybe<Maybe<A>>): Maybe<A> => pipe(ma, _.chain(id))

const fold = <A, B>(onNothing: Lazy<B>, onJust: (a: A) => B) => (
  ma: Maybe<A>
): B => {
  if (isNothing(ma)) {
    return onNothing()
  }

  return onJust(ma.a)
}

const elem = <A>(eqa: Eq<A>) => (a: A) => (ma: Maybe<A>): boolean => {
  if (isNothing(ma)) {
    return false
  }

  return eqa.equals(ma.a, a)
}

const exists = <A>(p: Predicate<A>) => (ma: Maybe<A>): boolean => {
  if (isNothing(ma)) {
    return false
  }

  return p(ma.a)
}

const getOrElse = <A>(a: Lazy<A>) => (ma: Maybe<A>): A => {
  if (isNothing(ma)) {
    return a()
  }

  return ma.a
}

const getOrElseW = <B>(b: Lazy<B>) => <A>(ma: Maybe<A>): A | B => {
  if (isNothing(ma)) {
    return b()
  }

  return ma.a
}

const alt = <A>(mb: Lazy<Maybe<A>>) => (ma: Maybe<A>): Maybe<A> => {
  if (isNothing(ma)) {
    return mb()
  }

  return ma
}

const altW = <B>(mb: Lazy<Maybe<B>>) => <A>(ma: Maybe<A>): Maybe<A | B> => {
  if (isNothing(ma)) {
    return mb()
  }

  return ma
}

// notice the implementation is the same, so we can just reuse the definition
// while providing a different type declaration:
const alt_: <A>(mb: Lazy<Maybe<A>>) => (ma: Maybe<A>) => Maybe<A> = altW

// "lift" a 2-arity function into a "Maybe" operation
const liftA2Maybe = <A, B, C>(f: (a: A) => (b: B) => C) => (ma: Maybe<A>) => (
  mb: Maybe<B>
): Maybe<C> => {
  if (isNothing(ma) || isNothing(mb)) {
    return nothing
  }

  const a = ma.a
  const b = mb.a

  return of(f(a)(b))
}

//// Examples

const ex1 = pipe(
  nothing,
  _.map(n => n + 1)
)

const ex2 = pipe(
  O.none,
  O.map(n => n + 1)
)

const ex3 = pipe(just(1), just, just, _.map(_.map(_.map(n => n + 1))))

const ex4 = pipe(just(1), just, just, _.chain(_.chain(_.map(n => n + 1))))

const ex5 = pipe(
  just(1),
  _.chain(n => _.of(n + 1))
)

const ex6 = pipe(just(1), ap(just((n: number) => n + 1)))

const ex7 = pipe(just(1), _.of, flatten)

const f = (n: number) => (s: string) => s.length + n

const ex8 = liftA2Maybe(f)(just(1))(just('hi'))

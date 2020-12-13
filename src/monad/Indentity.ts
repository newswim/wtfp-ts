/**
 * The "Identity Monad" is a pretty trivial monad.. but is it also useful?
 */

import { Apply } from './Apply'
import { Functor } from './Functor'
import { Applicative } from './Applicative'
import { Chain } from './Chain'
import { Monad } from './Monad'

type Identity<A> = MkIdentity<A>

const URI = 'Identity'
type URI = typeof URI

interface MkIdentity<A> {
  _tag: URI
  a: A
}

declare module 'fp-ts/HKT' {
  interface URItoKind<A> {
    readonly Identity: Identity<A>
  }
}

// Data Contructor

const id = <A>(a: A): Identity<A> => ({
  _tag: 'Identity',
  a,
})

// Functor

const map = <A, B>(f: (a: A) => B) => (ma: Identity<A>): Identity<B> => {
  const a = ma.a

  return id(f(a))
}

const Functor: Functor<'Identity'> = {
  URI,
  map,
}

// Apply

const ap = <A, B>(fab: Identity<(a: A) => B>) => (ma: Identity<A>): Identity<B> => {
  return id(fab.a(ma.a))
}

const Apply: Apply<'Identity'> = {
  URI,
  ap,
  map,
}

const of = id

const Applicative: Applicative<'Identity'> = {
  URI,
  of,
  ap,
  map,
}

const chain = <A, B>(afb: (a: A) => Identity<B>) => (ma: Identity<A>): Identity<B> => {
  return afb(ma.a)
}

const Chain: Chain<'Identity'> = {
  URI,
  ap,
  map,
  chain,
}

const Monad: Monad<'Identity'> = {
  ...Applicative,
  ...Chain,
}

/// Examples
